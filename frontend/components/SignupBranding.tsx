import React from 'react';
import AuthBrandPanel from './AuthBrandPanel';

const SignupBranding: React.FC = () => (
    <AuthBrandPanel
        heading={<>Start building <span className="ds-gradient-text">your proof</span></>}
        subline="Show what you can do, not just what you studied."
        points={['Build real projects with a team', 'Join hackathons and earn results', 'Get noticed by recruiters']}
    />
);

export default SignupBranding;
