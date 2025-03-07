const backendUrl = 'https://hidden-everglades-58171-9949524174bd.herokuapp.com/exchange-token';
const refreshTokenUrl = 'https://hidden-everglades-58171-9949524174bd.herokuapp.com/refresh-token';

let accessToken = '';
let refreshToken = '';
let tokenExpirationTime = 0; // Timestamp when the token expires

// Function to fetch the access token
async function fetchAccessToken(code) {
  const response = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code: code,
      redirect_uri: 'https://connorknows.best/spotify-callback'
    })
  });

  const data = await response.json();
  accessToken = data.access_token;
  refreshToken = data.refresh_token;
  tokenExpirationTime = Date.now() + 3600 * 1000; // Token expires in 1 hour
}

// Function to refresh the access token
async function refreshAccessToken() {
  const response = await fetch(refreshTokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      refresh_token: refreshToken
    })
  });

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpirationTime = Date.now() + 3600 * 1000; // Token expires in 1 hour
}

// Function to fetch the currently playing track
async function fetchCurrentlyPlaying() {
  if (Date.now() >= tokenExpirationTime) {
    await refreshAccessToken(); // Refresh token if expired
  }

  const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (response.status === 204) {
    console.log('No track is currently playing.');
    return null;
  }

  return await response.json();
}

// Function to fetch recently played tracks
async function fetchRecentlyPlayed() {
  if (Date.now() >= tokenExpirationTime) {
    await refreshAccessToken(); // Refresh token if expired
  }

  const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  return data.items[0]; // Return the most recently played track
}

// Function to update the "Currently Listening" widget
async function updateCurrentlyListening() {
  let trackData = await fetchCurrentlyPlaying();

  if (!trackData) {
    // Fallback to recently played tracks if no track is currently playing
    const recentlyPlayed = await fetchRecentlyPlayed();
    if (recentlyPlayed) {
      trackData = {
        item: recentlyPlayed.track,
        timestamp: new Date(recentlyPlayed.played_at).getTime()
      };
    } else {
      console.log('No recently played tracks found.');
      return;
    }
  }

  // Update the DOM with the track data
  const albumImage = document.querySelector('.listening__album img');
  const albumName = document.querySelector('.album__name');
  const artistName = document.querySelector('.artist__name');
  const playTime = document.querySelector('.play__time');

  albumImage.src = trackData.item.album.images[0].url; // Album image URL
  albumName.textContent = trackData.item.album.name; // Album name
  artistName.textContent = trackData.item.artists[0].name; // Artist name

  // Calculate and display how long ago the track was played
  const minutesAgo = Math.floor((Date.now() - trackData.timestamp) / 60000);
  if (minutesAgo >= 60) {
    const hoursAgo = Math.floor(minutesAgo / 60);
    playTime.textContent = `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`;
  } else {
    playTime.textContent = `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`;
  }
}

// Function to handle the Spotify authorization flow
function handleAuthorization() {
  const urlParams = new URLSearchParams(window.location.search);
  const authorizationCode = urlParams.get('code');

  if (authorizationCode) {
    fetchAccessToken(authorizationCode)
      .then(() => {
        // Redirect the user back to the main page
        window.location.href = 'https://connorknows.best';
      })
      .catch(error => console.error('Error fetching access token:', error));
  }
}

// Initialize the widget
function init() {
  handleAuthorization(); // Handle the Spotify authorization flow
  updateCurrentlyListening(); // Update the widget with the currently playing track
  setInterval(updateCurrentlyListening, 60000); // Update every 60 seconds
}

// Run the initialization function when the page loads
window.onload = init;