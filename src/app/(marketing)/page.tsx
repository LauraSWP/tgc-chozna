export default function HomePage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2563eb', fontSize: '48px', marginBottom: '20px' }}>
        🃏 My TCG - Working!
      </h1>
      <p style={{ fontSize: '24px', color: '#666', marginBottom: '30px' }}>
        A modern trading card game where coding meets strategy.
      </p>
      <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '8px', margin: '20px auto', maxWidth: '600px' }}>
        <h2 style={{ color: '#1f2937', marginBottom: '15px' }}>🎉 Success!</h2>
        <p>Marketing group page is working correctly.</p>
        <p>Build time: {new Date().toISOString()}</p>
        <p>This should resolve the routing conflict.</p>
      </div>
      <div style={{ marginTop: '30px' }}>
        <a href="/login" style={{ color: '#2563eb', textDecoration: 'underline' }}>Go to Login</a>
        {' | '}
        <a href="/test" style={{ color: '#2563eb', textDecoration: 'underline' }}>Test Route</a>
      </div>
    </div>
  );
}
