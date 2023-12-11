import {
    IconButton,
    DialogContent,
    Typography,
    Grid,
    Paper,
    Tabs,
    TextField,
    InputAdornment,
    Divider,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { StyledTab, StyledTabPanel } from './styles/SplitDetailsTabStyles';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import CloseIcon from '@mui/icons-material/Close';
import {
    equallyCalculatedValue,
    unequallyCalculatedValues,
} from './functions/SplitValueCalculations';
import debounce from 'lodash/debounce';

const SplitDetailsDialog = (props) => {
    const { open, setOpen, splitDetail, setSplitDetail, paidBy, totalAmount, splitBetweenUsers } =
        props;

    const [splitMethod, setSplitType] = useState(splitDetail?.splitMethod || 'E');

    const calculateSplitDetails = (splitMethodUpdated = false) => {
        // Applies only if values are split in shares.
        let totalShares = 0;
        if (splitMethod == 'S') {
            splitBetweenUsers?.forEach((splitUser) => {
                totalShares += parseFloat(
                    document.getElementById(`split-value-${splitUser?.id}`)?.value || 0
                );
            });
        }

        const splitValues = splitBetweenUsers?.map((splitUser) => {
            const inputValue = splitMethodUpdated
                ? 0
                : document.getElementById(`split-value-${splitUser?.id}`)?.value || 0;

            const value =
                splitMethod === 'E'
                    ? equallyCalculatedValue(totalAmount, splitBetweenUsers)
                    : inputValue;

            const calculatedAmount =
                splitMethod === 'E'
                    ? equallyCalculatedValue(totalAmount, splitBetweenUsers)
                    : unequallyCalculatedValues(totalAmount, inputValue, splitMethod, totalShares);

            const paidByThisUser = paidBy === splitUser;

            return {
                user: splitUser,
                value: parseFloat(value),
                calculatedAmount: paidByThisUser ? calculatedAmount : -calculatedAmount,
            };
        });

        const updatedSplitDetails = {
            splitMethod: splitMethod,
            splitUsers: splitBetweenUsers,
            splitValues: splitValues,
        };

        setSplitDetail(updatedSplitDetails);
    };

    useEffect(() => {
        calculateSplitDetails();
    }, [paidBy, totalAmount, splitBetweenUsers]);

    useEffect(() => {
        calculateSplitDetails(true);
    }, [splitMethod]);

    if (!open) {
        return <></>;
    }

    const getUsersAmt = (user) => {
        const userSplitDetails = splitDetail?.splitValues?.find((item) => item.user == user);
        const userAmt = userSplitDetails?.calculatedAmount;
        return userAmt ? Math.abs(userAmt).toFixed(2) : 0;
    };

    const handleChange = (event, newValue) => {
        setSplitType(newValue);
    };

    const handleTextValueChange = (event) => {
        calculateSplitDetails();
    };

    const calculateTotalTxtValue = () => {
        let calculatedTotal = 0;
        if (splitMethod !== 'E') {
            splitDetail['splitValues']?.forEach(
                (item) => (calculatedTotal += Math.abs(item.calculatedAmount))
            );
        }
        return `${calculatedTotal.toFixed(2)} of $${totalAmount}`;
    };

    const calculatedTotalText = calculateTotalTxtValue();

    return (
        <Paper elevation={2} style={{ maxWidth: '450px' }}>
            <Grid
                item
                sx={{
                    m: 0,
                    p: 1,
                    backgroundColor: '#1976d2',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
                id='customized-dialog-title'
            >
                Split Details
                <IconButton size='small' onClick={() => setOpen(false)}>
                    <CloseIcon sx={{ color: 'white' }} />
                </IconButton>
            </Grid>
            <DialogContent dividers sx={{ padding: '5px' }}>
                <Grid container direction='row' justify='flex-end' alignItems='center'>
                    <Grid item xs={12}>
                        <Tabs
                            value={splitMethod}
                            onChange={handleChange}
                            variant='fullWidth'
                            TabIndicatorProps={{
                                style: { backgroundColor: 'transparent' },
                            }}
                        >
                            <StyledTab value='E' label='=' tooltipText='Split Equally' />
                            <StyledTab value='P' label='%' tooltipText='Split in Percentage' />
                            <StyledTab
                                value='U'
                                label='1.23'
                                tooltipText='Split in Exact Amounts'
                            />
                            <StyledTab
                                value='S'
                                icon={<EqualizerIcon />}
                                tooltipText='Split in Shares'
                            />
                        </Tabs>
                    </Grid>
                </Grid>
                <StyledTabPanel value={splitMethod} index={'E'}>
                    {splitMethod === 'E' && (
                        <Grid item xs={12}>
                            <Grid container>
                                <Grid item xs={12}>
                                    <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                        Split Equally
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    {splitDetail?.splitValues?.map((infoDict) => (
                                        <Grid container key={infoDict.user.email}>
                                            <Grid item xs={10}>
                                                {infoDict.user.display_name}
                                            </Grid>
                                            <Grid item xs={2} sx={{ textAlign: 'end' }}>
                                                $
                                                {(
                                                    totalAmount / splitDetail?.splitValues?.length
                                                ).toFixed(2)}
                                            </Grid>
                                        </Grid>
                                    ))}
                                </Grid>
                                <Grid item xs={12}>
                                    <Grid container>
                                        <Grid item xs={8}>
                                            <strong>Total:</strong>
                                        </Grid>
                                        <Grid item xs={4} sx={{ textAlign: 'end' }}>
                                            <strong>${totalAmount}</strong>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}
                </StyledTabPanel>
                <StyledTabPanel value={splitMethod} index={'P'}>
                    {splitMethod === 'P' && (
                        <Grid item xs={12}>
                            <Grid container>
                                <Grid item xs={12}>
                                    <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                        Split in Percentage
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    {splitDetail?.splitValues?.map((infoDict) => (
                                        <Grid container key={infoDict.user.email} sx={{ mt: 1 }}>
                                            <Grid item xs={7}>
                                                {infoDict.user.display_name} 
                                            </Grid>
                                            <Grid item xs={2} sx={{ textAlign: 'start' }}>
                                                {`$ ${getUsersAmt(infoDict.user)}`}
                                            </Grid>
                                            <Grid item xs={3} sx={{ textAlign: 'end' }}>
                                                {/* prettier-ignore */}
                                                <TextField
                                                    id={`split-value-${infoDict.user?.id}`}
                                                    size='small'
                                                    variant='standard'
                                                    type='number'
                                                    value={infoDict.value || ''}
                                                    onChange={handleTextValueChange}
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position='start'>%</InputAdornment>,
                                                      }}
                                                />
                                            </Grid>
                                        </Grid>
                                    ))}
                                </Grid>
                                <Grid item xs={12} sx={{ mt: 2 }}>
                                    <Divider />
                                    <Grid container sx={{ mt: 1 }}>
                                        <Grid item xs={8}>
                                            <strong>Total:</strong>
                                        </Grid>
                                        <Grid item xs={4} sx={{ textAlign: 'end' }}>
                                            <strong>${calculatedTotalText}</strong>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}
                </StyledTabPanel>
                <StyledTabPanel value={splitMethod} index={'U'}>
                    {splitMethod === 'U' && (
                        <Grid item xs={12}>
                            <Grid container>
                                <Grid item xs={12}>
                                    <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                        Split by unequal amounts
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    {splitDetail?.splitValues?.map((infoDict) => (
                                        <Grid container key={infoDict.user.email} sx={{ mt: 1 }}>
                                            <Grid item xs={8}>
                                                {infoDict.user.display_name}
                                            </Grid>
                                            <Grid item xs={2} sx={{ textAlign: 'start' }}>
                                                {`$ ${getUsersAmt(infoDict.user)}`}
                                            </Grid>
                                            <Grid item xs={2} sx={{ textAlign: 'end' }}>
                                                <TextField
                                                    id={`split-value-${infoDict.user?.id}`}
                                                    size='small'
                                                    variant='standard'
                                                    type='number'
                                                    value={infoDict.value || ''}
                                                    onChange={handleTextValueChange}
                                                />
                                            </Grid>
                                        </Grid>
                                    ))}
                                </Grid>
                                <Grid item xs={12} sx={{ mt: 2 }}>
                                    <Divider />
                                    <Grid container sx={{ mt: 1 }}>
                                        <Grid item xs={8}>
                                            <strong>Total:</strong>
                                        </Grid>
                                        <Grid item xs={4} sx={{ textAlign: 'end' }}>
                                            <strong>${calculatedTotalText}</strong>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}
                </StyledTabPanel>
                <StyledTabPanel value={splitMethod} index={'S'}>
                    {splitMethod === 'S' && (
                        <Grid item xs={12}>
                            <Grid container>
                                <Grid item xs={12}>
                                    <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                        Split in Shares
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    {splitDetail?.splitValues?.map((infoDict) => (
                                        <Grid container key={infoDict.user.email} sx={{ mt: 1 }}>
                                            <Grid item xs={8}>
                                                {infoDict.user.display_name}
                                            </Grid>
                                            <Grid item xs={2} sx={{ textAlign: 'start' }}>
                                                {`$ ${getUsersAmt(infoDict.user)}`}
                                            </Grid>
                                            <Grid item xs={2} sx={{ textAlign: 'end' }}>
                                                <TextField
                                                    id={`split-value-${infoDict.user?.id}`}
                                                    size='small'
                                                    variant='standard'
                                                    type='number'
                                                    value={infoDict.value || ''}
                                                    onChange={handleTextValueChange}
                                                />
                                            </Grid>
                                        </Grid>
                                    ))}
                                </Grid>
                                <Grid item xs={12} sx={{ mt: 2 }}>
                                    <Divider />
                                    <Grid container sx={{ mt: 1 }}>
                                        <Grid item xs={8}>
                                            <strong>Total:</strong>
                                        </Grid>
                                        <Grid item xs={4} sx={{ textAlign: 'end' }}>
                                            <strong>${calculatedTotalText}</strong>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}
                </StyledTabPanel>
            </DialogContent>
        </Paper>
    );
};

export default SplitDetailsDialog;