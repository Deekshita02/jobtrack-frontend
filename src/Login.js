import { useState } from 'react';

const API_URL = 'https://jobtrack-api-r4i9.onrender.com';

function Login({ onLoginSuccess }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const endpoint = isRegistering ? 'register' : 'login';

        try {
            const response = await fetch(`${API_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || 'Something went wrong');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            onLoginSuccess(data.token);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <h1>JobTrack</h1>
            <form onSubmit={handleSubmit} className="form">
                <h2>{isRegistering ? 'Create an Account' : 'Log In'}</h2>
                {error && <p className="error">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">{isRegistering ? 'Register' : 'Log In'}</button>
            </form>
            <p className="toggle-link" onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Register"}
            </p>
        </div>
    );
}

export default Login;