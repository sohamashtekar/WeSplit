import { axiosPrivate } from '../../api/axios';
// prettier-ignore
import { Button, Dialog, DialogContent, IconButton, Typography, Grid, Autocomplete, TextField, Divider, Paper, Menu, MenuItem, } from '@mui/material';
import { saveExpenseAPI } from '../../api/api';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import CustomDialogPaperBlank from '../generic/CustomDialogPaperBlank';
import SplitDetailsDialog from './SplitDetailsDialog';
import useUserData from '../../hooks/useUserData';

function getTodaysDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function ExpenseOwnerMenu(props) {
    const { anchorEl, setAnchorEl, options, setPaidBy, userInfo } = props;

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOwnerChange = (newOwner) => {
        setPaidBy(newOwner);
        handleClose();
    };

    return (
        <Menu
            id='paid-by-menu'
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
        >
            <MenuItem
                key={userInfo?.email}
                onClick={() => {
                    handleOwnerChange(userInfo);
                }}
            >
                You ({userInfo?.display_name})
            </MenuItem>
            {options.map((friend) => (
                <MenuItem
                    key={friend.display_name}
                    onClick={() => {
                        handleOwnerChange(friend);
                    }}
                >
                    {friend.display_name}
                </MenuItem>
            ))}
        </Menu>
    );
}

function NewExpenseDialog(props) {
    const { open, setOpen } = props;
    const { userData } = useUserData();

    const userInfo = userData?.user_info;
    const friends = userData?.friends;

    const [anchorEl, setAnchorEl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openSplitDetail, setOpenSplitDetail] = useState(false);

    const [selectedUsers, setSelectedUsers] = useState([]);
    const [splitBetweenUsers, setSplitBetweenUsers] = useState([]);
    const [desc, setDesc] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [expenseDate, setExpenseDate] = useState(getTodaysDate());
    const [note, setNote] = useState('');
    const [paidBy, setPaidBy] = useState(userInfo);
    const [splitDetail, setSplitDetail] = useState({
        splitMethod: 'E',
        splitUsers: [],
        splitValues: [],
    });

    if (!open) {
        return <></>;
    }

    const getMyAmount = () => {
        const isPaidByMe = paidBy.id === userInfo.id;
        const myShare = splitDetail.splitValues.find((item) => item.user.id === userInfo.id);
        const myCalculatedShare = myShare?.calculatedAmount || 0;
        const mySettlement = parseFloat(
            isPaidByMe ? totalAmount - myCalculatedShare : Math.abs(myCalculatedShare)
        ).toFixed(2);
        return myCalculatedShare
            ? isPaidByMe
                ? `You get ${mySettlement}$`
                : `You pay ${mySettlement}$`
            : '';
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSelectedUsersChange = (updatedUsers) => {
        setSelectedUsers(updatedUsers);
        setSplitBetweenUsers([...updatedUsers, userInfo]);
    };

    const handleSplit = () => {
        setOpenSplitDetail(true);
    };

    const validateExpenseData = () => {
        // Validation functions
        const getErrors = () => {
            let calculatedTotal = 0;
            let userDoesNotOwe = false;

            splitDetail.splitValues.forEach((item) => {
                calculatedTotal += Math.abs(item.calculatedAmount);

                userDoesNotOwe =
                    Math.abs(item.calculatedAmount) === 0 ? item.user.display_name : userDoesNotOwe;
            });

            return {
                totalAmtErr: !(calculatedTotal === totalAmount),
                userDoesNotIncludedErr: userDoesNotOwe,
            };
        };
        return getErrors();
    };

    const saveExpense = async (e) => {
        e.preventDefault();

        const { totalAmtErr, userDoesNotIncludedErr } = validateExpenseData();

        if (totalAmtErr) {
            alert('Shared expenses do not sum up to Total Amount provided, Please fix this error!');
            return;
        }

        if (userDoesNotIncludedErr) {
            if (
                !window.confirm(
                    `${userDoesNotIncludedErr} is added to the expense but, expenses are not shared with this user, do you want to continue?\nUser will be removed from this expense automatically!`
                )
            ) {
                return;
            }
        }

        setLoading(true);
        try {
            const splitDetailObj = splitDetail.splitValues.map((item) => {
                return {
                    user: item.user.id,
                    split_method: splitDetail.splitMethod,
                    value: item.value,
                    calculated_amount: parseFloat(item.calculatedAmount).toFixed(2),
                };
            });

            const requestData = {
                total_amount: totalAmount,
                description: desc,
                split_method: splitDetail.splitMethod,
                split_detail: splitDetailObj,
                note: note,
                created_by: userInfo.id,
                paid_by: paidBy.id,
            };

            const response = await axiosPrivate.post(saveExpenseAPI, requestData);
            setOpen(false);
            alert('Expense saved!');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={(e) => {
                    e.preventDefault();
                }}
                PaperComponent={CustomDialogPaperBlank}
                disableScrollLock={true}
            >
                <Grid container justifyContent={'center'} alignItems={'center'} spacing={2}>
                    <Grid item style={{ display: 'flex', justifyContent: 'center' }}>
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
                            >
                                Share Expense
                                <IconButton size='small' onClick={() => setOpen(false)}>
                                    <CloseIcon sx={{ color: 'white' }} />
                                </IconButton>
                            </Grid>
                            <DialogContent dividers>
                                <ExpenseOwnerMenu
                                    userInfo={userInfo}
                                    options={selectedUsers}
                                    anchorEl={anchorEl}
                                    setAnchorEl={setAnchorEl}
                                    setPaidBy={setPaidBy}
                                />
                                <form onSubmit={saveExpense}>
                                    <Grid container spacing={1} style={{ minWidth: '200px' }}>
                                        <Grid item xs={12}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'start',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <label
                                                    htmlFor='users'
                                                    style={{ marginRight: 5, textWrap: 'nowrap' }}
                                                >
                                                    Split between <strong>You</strong> and:
                                                </label>
                                                <Autocomplete
                                                    disabled={loading}
                                                    multiple
                                                    fullWidth
                                                    required
                                                    id='users'
                                                    size='small'
                                                    value={selectedUsers}
                                                    options={friends}
                                                    getOptionLabel={(option) => option.display_name}
                                                    onChange={(event, newValue, reason) => {
                                                        handleSelectedUsersChange(newValue, reason);
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            variant='standard'
                                                            placeholder='Type Name or Email'
                                                            required={!selectedUsers.length > 0}
                                                        />
                                                    )}
                                                />
                                            </div>
                                            <Divider style={{ marginTop: 9 }} />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                disabled={loading}
                                                required
                                                name='desc'
                                                variant='standard'
                                                label='Description'
                                                size='small'
                                                onChange={(e) => setDesc(e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                disabled={loading}
                                                required
                                                name='amount'
                                                variant='standard'
                                                label='Total Amount'
                                                size='small'
                                                type='number'
                                                onChange={(e) =>
                                                    setTotalAmount(parseFloat(e.target.value))
                                                }
                                            />
                                        </Grid>
                                        <Grid item xs={12} style={{ textAlign: 'center' }}>
                                            <Typography component={'div'} variant='p'>
                                                <span>Paid by </span>
                                                <Button
                                                    disabled={loading}
                                                    style={{ padding: 0, minWidth: 0 }}
                                                    aria-controls='paid-by-menu'
                                                    aria-haspopup='true'
                                                    onClick={(e) => setAnchorEl(e.currentTarget)}
                                                >
                                                    {paidBy === userInfo
                                                        ? 'You'
                                                        : paidBy?.display_name}
                                                </Button>
                                                <span> and split </span>
                                                <Button
                                                    disabled={loading}
                                                    style={{ padding: 0 }}
                                                    onClick={() => handleSplit()}
                                                >
                                                    {splitDetail.splitMethod === 'E'
                                                        ? 'Equally'
                                                        : 'Unequally'}
                                                </Button>
                                                .
                                            </Typography>
                                            <Typography component={'div'} variant='p'>
                                                {getMyAmount()}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <TextField
                                                disabled={loading}
                                                required
                                                fullWidth
                                                name='expenseDateTime'
                                                variant='standard'
                                                label='Date'
                                                size='small'
                                                type='date'
                                                value={expenseDate}
                                                InputLabelProps={{ shrink: true }}
                                                onChange={(e) => setExpenseDate(e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={8}>
                                            <TextField
                                                disabled={loading}
                                                fullWidth
                                                name='note'
                                                variant='standard'
                                                label='Note'
                                                size='small'
                                                onChange={(e) => setNote(e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Divider />
                                            <Grid
                                                item
                                                xs={12}
                                                sx={{
                                                    pt: 1,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                }}
                                            >
                                                <Button
                                                    disabled={loading}
                                                    size='small'
                                                    color='inherit'
                                                    variant='contained'
                                                    autoFocus
                                                    onClick={handleClose}
                                                >
                                                    Cancle
                                                </Button>
                                                <Button
                                                    disabled={loading}
                                                    size='small'
                                                    type='submit'
                                                    color='primary'
                                                    variant='contained'
                                                    autoFocus
                                                >
                                                    Submit
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </form>
                            </DialogContent>
                        </Paper>
                    </Grid>

                    <Grid item style={{ display: 'flex', justifyContent: 'center' }}>
                        <SplitDetailsDialog
                            open={openSplitDetail}
                            setOpen={setOpenSplitDetail}
                            splitDetail={splitDetail}
                            setSplitDetail={setSplitDetail}
                            paidBy={paidBy}
                            totalAmount={totalAmount}
                            splitBetweenUsers={splitBetweenUsers}
                        />
                    </Grid>
                </Grid>
            </Dialog>
        </>
    );
}

export default NewExpenseDialog;