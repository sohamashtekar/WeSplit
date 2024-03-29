import { axiosPrivate } from '../../api/axios';
import { CustomDialogHeader } from '../generic/styles/CustomDIalogHeader';
// prettier-ignore
import { Dialog, DialogContent, DialogActions, Button, Grid, TextField, Autocomplete, Divider, Paper, IconButton } from '@mui/material';
import { userGroupAPI } from '../../api/api';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import CustomDialogPaperBlank from '../generic/CustomDialogPaperBlank';
import useUserData from '../../hooks/useUserData';

const CreateGroupDialog = (props) => {
    const { open, setOpen } = props;
    const { userData, userDataQuery } = useUserData();

    const userInfo = userData?.user_info;
    const friends = userData?.friends;

    const [loading, setLoading] = useState(false);

    const [groupName, setGroupName] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);

    const handleClose = () => {
        setOpen(false);
    };

    const handleGroupMembersChange = (updatedMembers) => {
        setGroupMembers(updatedMembers);
    };

    const createGroup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const groupMembersId = [...groupMembers, userInfo]?.map((item) => item.id);
            const requestData = {
                name: groupName,
                members: groupMembersId,
                created_by: userInfo.id,
            };
            await axiosPrivate.post(userGroupAPI, requestData);
            userDataQuery.refetch();
            setOpen(false);
            alert('Group created!');
        } catch (err) {
            alert('Error occurred, contact our support team!');
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
                <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                    <Paper elevation={2}>
                        <CustomDialogHeader item>
                            Create New Group
                            <IconButton size='small' onClick={() => setOpen(false)}>
                                <CloseIcon sx={{ color: 'white' }} />
                            </IconButton>
                        </CustomDialogHeader>
                        <form onSubmit={createGroup}>
                            <DialogContent dividers>
                                <Grid container spacing={2} style={{ minWidth: '200px' }}>
                                    <Grid item xs={12}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'start',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <label
                                                htmlFor='group_name'
                                                style={{ marginRight: 10, textWrap: 'nowrap' }}
                                            >
                                                Group Name:
                                            </label>
                                            <TextField
                                                required
                                                fullWidth
                                                id='group_name'
                                                variant='standard'
                                                size='small'
                                                value={groupName}
                                                onChange={(e) => {
                                                    setGroupName(e.target.value);
                                                }}
                                            />
                                        </div>
                                    </Grid>
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
                                                With <strong>You</strong> and:
                                            </label>
                                            <Autocomplete
                                                disabled={loading}
                                                multiple
                                                fullWidth
                                                required
                                                id='users'
                                                size='small'
                                                sx={{ width: '100%' }}
                                                value={groupMembers}
                                                options={friends}
                                                getOptionLabel={(option) => option.display_name}
                                                onChange={(event, newValue, reason) => {
                                                    handleGroupMembersChange(newValue, reason);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        variant='standard'
                                                        placeholder='Type Name'
                                                        required={!groupMembers.length > 0}
                                                    />
                                                )}
                                            />
                                        </div>
                                        <Divider style={{ marginTop: 9 }} />
                                    </Grid>
                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose}>Cancel</Button>
                                <Button type='submit'>Create Group</Button>
                            </DialogActions>
                        </form>
                    </Paper>
                </Grid>
            </Dialog>
        </>
    );
};

export default CreateGroupDialog;
