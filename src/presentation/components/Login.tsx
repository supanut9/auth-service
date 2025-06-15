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

  const facebookLoginUrl = new URL(
    `${config.url.baseUrl}/api/auth/facebook/login`
  );
  facebookLoginUrl.searchParams.set('state', state);

  const lineLoginUrl = new URL(`${config.url.baseUrl}/api/auth/line/login`);
  lineLoginUrl.searchParams.set('state', state);

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

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <a
              href={googleLoginUrl.toString()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '12px',
                backgroundColor: '#fff',
                color: '#444',
                border: '1px solid #ddd',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              <iconify-icon
                icon='logos:google-icon'
                width='16'
                height='16'
              />
              <span>Continue with Google</span>
            </a>
            <a
              href={facebookLoginUrl.toString()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '12px',
                backgroundColor: '#1877F2',
                color: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              <iconify-icon
                icon='logos:facebook'
                width='16'
                height='16'
              ></iconify-icon>
              <span>Continue with Facebook</span>
            </a>
            <a
              href={lineLoginUrl.toString()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '12px',
                backgroundColor: '#06C755',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              }}
            >
              <iconify-icon
                icon='streamline-logos:line-app-logo-solid'
                width='16'
                height='16'
                style='color: #fff'
              />
              <span>Continue with LINE</span>
            </a>
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
