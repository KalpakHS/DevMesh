const run = async () => {
  try {
    // 1. Login
    console.log('Logging in as recruiter...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'recru@gmail.com',
      password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    console.log('Login Response Data:', loginData);

    const token = loginData.data?.accessToken;
    console.log('Login successful. Token acquired:', token ? 'YES' : 'NO');

    // 2. Fetch developers
    console.log('Fetching developers from recruiter search endpoint with empty query params...');
    const searchRes = await fetch('http://localhost:5000/api/recruiter/developers?search=&skills=&college=&availability=&minRep=&sortBy=reputation', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const searchData = await searchRes.json();

    console.log('Search Response Status:', searchData.status);
    console.log('Number of developers returned:', searchData.data?.developers?.length);
    if (searchData.data?.developers?.length > 0) {
      console.log('First candidate name:', searchData.data.developers[0].name);
    }

    // 2.5 Fetch bookmarks
    console.log('Fetching recruiter bookmarks...');
    const bookRes = await fetch('http://localhost:5000/api/recruiter/bookmarks', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const bookData = await bookRes.json();
    console.log('Bookmarks response status:', bookData.status);
    console.log('Bookmarks count:', bookData.data?.developers?.length);

    // 3. Fetch dashboard
    console.log('Fetching recruiter dashboard...');
    const dashRes = await fetch('http://localhost:5000/api/recruiter/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const dashData = await dashRes.json();
    console.log('Dashboard stats:', dashData.data?.stats);
    console.log('Top developers count:', dashData.data?.topDevelopers?.length);

  } catch (err) {
    console.error('Error during API test:', err.message);
  }
};

run();
