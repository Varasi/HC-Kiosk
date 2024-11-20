
export const REGION = 'ap-south-1';
export const POOL_ID= 'ap-south-1_gNzEsBZpV';
export const CLIENT_ID= '2e7odi4eesjhlkrbkv3iu56kim';
export const IDENTITY_POOL_ID = 'ap-south-1:32dfc4b7-32cb-4ec5-a3f5-508c3abf3bc1';
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const awsmobile = {
    Auth:{
    Cognito:{    
    region: REGION,
    userPoolId: IDENTITY_POOL_ID, // Optional, if you're using identity pool
    userPoolClientId: CLIENT_ID,
    identityPoolId:IDENTITY_POOL_ID
    }
}
};


export default awsmobile;
