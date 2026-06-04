
const getOtpEmailTemplate = (otp) => {
    return `
        <div style="background: linear-gradient(135deg,rgb(252, 250, 248) 0%,rgb(254, 255, 219) 100%); padding: 30px; font-family: 'Segoe UI', sans-serif; text-align: center;">
            <img src="https://heliku-dev-ed.develop.my.salesforce.com/servlet/servlet.ImageServer?id=015J40000002fhb&oid=00D5j00000CLfI6&lastMod=1750757318000" alt="Happy Child Logo" width="120" style="margin-bottom: 20px;" />
            <h2 style="color:rgb(0, 136, 204);">Welcome to Happy Child!</h2>
            <p style="font-size: 16px; color: #333;">Use the following One-Time Password (OTP) to verify your email:</p>
            <div style="font-size: 24px; font-weight: bold; color:rgb(71, 72, 72); margin: 20px 0;">${otp}</div>
            <p style="font-size: 14px; color: #777;">This OTP is valid for 10 minutes.</p>
            <hr style="margin: 30px 0;" />
            <p style="font-size: 12px; color: #aaa;">If you didn't request this, you can safely ignore this email.</p>
        </div>
    `;
    /* return `
  <div style="background: linear-gradient(135deg,rgb(252, 250, 248) 0%,rgb(254, 255, 219) 100%); padding: 30px; font-family: 'Segoe UI', sans-serif; text-align: center;">
    <img src="https://heliku-dev-ed.develop.my.salesforce.com/servlet/servlet.ImageServer?id=015J40000002fhb&oid=00D5j00000CLfI6&lastMod=1750757318000" alt="Happy Child Logo" width="120" style="margin-bottom: 20px;" />
    <h2 style="color:rgb(0, 136, 204);">Welcome to Happy Child!</h2>
    <p style="font-size: 16px; color: #333;">
      <a target="_self" href="https://siriusnovadx.com/verify?token=abc123" 
      style="color: rgb(0, 102, 204); text-decoration: underline;">
        Click here
      </a> to verify your emaill.
    </p>
    <hr style="margin: 30px 0;" />
    <p style="font-size: 12px; color: #aaa;">If you didn't request this, you can safely ignore this email.</p>
  </div>
`; */
};

module.exports = getOtpEmailTemplate;