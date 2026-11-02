import React from 'react';
import AuthBrandPanel from './AuthBrandPanel';

const LoginBranding: React.FC = () => (
    <AuthBrandPanel
        heading={<>Good to see <span className="ds-gradient-text">you again</span></>}
        subline="Pick up right where you left off."
        points={['Your projects and profile', 'Events, teams and results', 'Invitations from recruiters']}
    />
);

export default LoginBranding;
