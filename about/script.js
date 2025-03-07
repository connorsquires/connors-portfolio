// Replace with your manually fetched access token
const accessToken = process.env.ACCESS_TOKEN; // This should be securely stored or set
let tokenExpirationTime = Date.now() + 3600 * 1000; // Token expires in 1 hour

// Function to refresh the access token (optional if you're manually refreshing it)
async function refreshAccessToken() {
  const response = await fetch('https://hidden-everglades-58171-9949524174bd.herokuapp.com/refresh-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      refresh_token: process.env.REFRESH_TOKEN // Ensure you are passing the refresh token stored
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

// Function to update the "Currently Listening" widget
async function updateCurrentlyListening() {
  let trackData = await fetchCurrentlyPlaying();

  if (!trackData) {
    console.log('No track currently playing.');
    return;
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

// Initialize the widget
function init() {
  updateCurrentlyListening(); // Update the widget with the currently playing track
  setInterval(updateCurrentlyListening, 60000); // Update every 60 seconds
}

// Run the initialization function when the page loads
window.onload = init;
