import { Grid } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './dashboard/Dashboard';
import LandingPage from './landing-page/LandingPage';
import LogIn from './authentication/LogIn';
import Missing from './authentication/Missing';
import Navbar from './layout/Navbar';
import React from 'react';
import RequireAuth from './authentication/RequireAuth';
import SignUp from './authentication/SignUp';
import PersistLogin from './authentication/PersistLogin';

function ElementWrapper({ children }) {
    return (
        <>
            <Navbar />
            <Grid
                container
                style={{
                    padding: '2%',
                    height: '91dvh',
                }}
            >
                <Grid item xs={12}>
                    {children}
                </Grid>
            </Grid>
        </>
    );
}

function RouteWrapper() {
    return (
        <Routes>
            <Route element={<PersistLogin />}>
                <Route
                    path='/'
                    element={
                        <ElementWrapper>
                            <LandingPage />
                        </ElementWrapper>
                    }
                />

                <Route
                    path='/login'
                    element={
                        <ElementWrapper>
                            <LogIn />
                        </ElementWrapper>
                    }
                />
            </Route>

            <Route
                path='/signup'
                element={
                    <ElementWrapper>
                        <SignUp />
                    </ElementWrapper>
                }
            />

            {/* Protected routes start here */}
            <Route element={<PersistLogin />}>
                <Route element={<RequireAuth allowedRoles={[]} />}>
                    <Route
                        path='/dashboard'
                        element={
                            <ElementWrapper>
                                <Dashboard />
                            </ElementWrapper>
                        }
                    />
                </Route>
            </Route>

            <Route
                path='*'
                element={
                    <ElementWrapper>
                        <Missing />
                    </ElementWrapper>
                }
            />
        </Routes>
    );
}

export default RouteWrapper;
