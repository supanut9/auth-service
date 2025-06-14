import { Context, redirect } from 'elysia';
import { OAuth2Client } from 'google-auth-library'; // 1. Import Google's library
// import jwt from 'jsonwebtoken'; // To create your own session token

// 2. Initialize the Google Auth Client outside your controller
// This reuses the same client instance for all requests.
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthController {
  constructor() {}

  // This method is for your own email/password login
  async login(context: Context) {
    const { set, cookie } = context;

    // ... your password validation logic here ...
    const user = { id: 'user-from-db-123' };

    // Create your application's session token
    const sessionToken = 'session_token';

    cookie.auth_token.set({
      // Changed to auth_token for consistency
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      path: '/',
      sameSite: 'lax',
      maxAge: 7 * 86400,
    });

    return { success: true, message: 'Logged in successfully' };
  }

  // This method handles the completed Google Login flow
  async googleCallback(context: Context) {
    const { query, cookie, set } = context;
    const { code, state } = query;

    if (!code) {
      set.status = 400;
      return { error: 'Authorization code is missing.' };
    }

    // Default redirect location if state is not present or invalid
    let finalRedirectUrl = '/dashboard';

    try {
      // --- Exchange code for tokens (your existing code is great) ---
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: process.env.GOOGLE_CALLBACK_URL,
          grant_type: 'authorization_code',
        }),
      });
      const tokens = await tokenResponse.json();

      console.log('token', tokens);

      if (tokens.error) throw new Error(tokens.error_description);

      console.log(tokens);

      // --- a. Securely verify the id_token and get user info ---
      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const googlePayload = ticket.getPayload();
      if (!googlePayload) throw new Error('Could not verify Google user.');

      const { sub: googleId, email, name, picture } = googlePayload;

      // TODO: check whether we have googleId if yes, just create session and return if not just create user and attach which googleId and create session

      // TODO: after create session -> create cookie with that session

      // TODO: redirect to /authorize with the same query

      //   if (state) {
      //     const decodedState = JSON.parse(atob(state as string));
      //     // You would also verify a CSRF token from the state here
      //     if (decodedState.returnTo) {
      //       finalRedirectUrl = decodedState.returnTo;
      //     }
      //   }

      // 110914249249035508176

      // --- c. Create a session for the user in YOUR app ---
      const sessionToken = 'session_token';

      // Set the exact same cookie as your normal login method
      cookie.auth_token.set({
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
        maxAge: 7 * 86400,
      });

      // --- d. Redirect the user back to your frontend ---
      return redirect(finalRedirectUrl, 307);
    } catch (error) {
      console.error('An error occurred during Google callback:', error);
      // On failure, redirect back to the login page with an error
      return redirect('/login?error=google_failed', 307);
    }
  }
}
