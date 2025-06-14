import { config } from '../../config';
import Layout from './Layout';
import { Html } from '@kitajs/html';

// Define the props for our page
interface LoginPageProps {
  client_id: string;
  redirect_uri: string;
  response_type: string;
  scope?: string;
  state?: string;
  error?: string;
}

export const LoginPage = (props: LoginPageProps) => {
  const state = JSON.stringify(props);

  const googleLoginUrl = new URL(`${config.url.baseUrl}/api/auth/google/login`);
  googleLoginUrl.searchParams.set('state', state);

  return (
    <Layout title='Sign In'>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '420px', // Adjusted max-width for new elements
          padding: '2rem',
          margin: 'auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '1.8rem',
              fontWeight: 600,
              color: '#2c3e50',
              margin: 0,
            }}
          >
            Your Application
          </h1>
        </div>
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
            padding: '2.5rem',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <h2>Welcome Back</h2>
          <p
            style={{
              color: '#777',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
            }}
          >
            Sign in to continue to <strong safe>{props.client_id}</strong>
          </p>

          {/* Error Message Display */}
          {props.error && (
            <p
              style={{
                backgroundColor: '#ffebee',
                color: '#d32f2f',
                border: '1px solid #e57373',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '1.5rem',
              }}
            >
              {props.error}
            </p>
          )}

          {/* Login Form */}
          <form
            method='POST'
            action='/login'
          >
            {/* Hidden fields... */}
            <input
              type='hidden'
              name='client_id'
              value={props.client_id}
            />
            <input
              type='hidden'
              name='redirect_uri'
              value={props.redirect_uri}
            />
            <input
              type='hidden'
              name='response_type'
              value={props.response_type}
            />
            <input
              type='hidden'
              name='scope'
              value={props.scope}
            />
            <input
              type='hidden'
              name='state'
              value={props.state}
            />

            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label
                for='username'
                style={{
                  display: 'block',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: '#555',
                  marginBottom: '0.3rem',
                }}
              >
                Email Address
              </label>
              <input
                type='email'
                id='username'
                name='username'
                required
                autofocus
                placeholder='your.email@example.com'
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label
                for='password'
                style={{
                  display: 'block',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: '#555',
                  marginBottom: '0.3rem',
                }}
              >
                Password
              </label>
              <input
                type='password'
                id='password'
                name='password'
                required
                placeholder='Your secure password'
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type='submit'
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>
          </form>

          {/* --- NEW: Social Login Divider --- */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              color: '#aaa',
              margin: '1.5rem 0',
            }}
          >
            <hr
              style={{ flex: 1, border: 'none', borderTop: '1px solid #eee' }}
            />
            <span style={{ padding: '0 1rem', fontSize: '0.85rem' }}>OR</span>
            <hr
              style={{ flex: 1, border: 'none', borderTop: '1px solid #eee' }}
            />
          </div>

          {/* --- NEW: Social Login Buttons --- */}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <a
              href={googleLoginUrl.toString()}
              style={{
                /* your button styles */
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                backgroundColor: '#fff',
                color: '#444',
                border: '1px solid #ddd',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 48 48'
                style={{ marginRight: '10px' }}
              >
                <path
                  fill='#FFC107'
                  d='M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z'
                />
                <path
                  fill='#FF3D00'
                  d='m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z'
                />
                <path
                  fill='#4CAF50'
                  d='M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.618-3.66-11.083-8.584l-6.522 5.025A20.01 20.01 0 0 0 24 44z'
                />
                <path
                  fill='#1976D2'
                  d='M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C42.018 35.083 44 30.023 44 24c0-1.341-.138-2.65-.389-3.917z'
                />
              </svg>
              Continue with Google
            </a>

            {/* Facebook Button (example) */}
            <button
              type='button'
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '12px',
                backgroundColor: '#1877F2',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='currentColor'
                style={{ marginRight: '10px' }}
              >
                <path d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z' />
              </svg>
              Continue with Facebook
            </button>
          </div>
        </div>

        {/* --- NEW: Footer Links --- */}
        <div
          style={{
            marginTop: '2rem',
            fontSize: '0.9rem',
            color: '#606770',
            textAlign: 'center',
          }}
        >
          <span>Don't have an account? </span>
          <a
            href='/register'
            style={{
              color: '#007bff',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Sign Up
          </a>
          <span style={{ margin: '0 8px' }}>·</span>
          <a
            href='/forgot-password'
            style={{
              color: '#007bff',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Forgot Password?
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
