fetch('https://hidden-everglades-58171-9949524174bd.herokuapp.com/currently-playing')
    .then(response => response.json())
    .then(data => {
        // Check if there's data for the song and artist
        if (data.song && data.artist) {
            // If track is playing or a recent track is found
            document.getElementById('song-name').textContent = data.song;
            document.getElementById('artist-name').textContent = data.artist;
            document.getElementById('album-cover').src = data.album_art || '../assets/images/default-album.jpg'; // Default image if no album cover
           
            document.getElementById('play-time').textContent = data.timestamp || 'N/A'; // Format the timestamp
            
        } else {
            // If no song is playing and no recent tracks are available
            document.getElementById('song-name').textContent = 'No track playing';
            document.getElementById('artist-name').textContent = '';
            document.getElementById('album-cover').src = '../assets/images/default-album.jpg'; // Default image
            document.getElementById('play-time').textContent = 'N/A';
        }
    })
    .catch(error => {
        console.error('Error fetching track information:', error);
        // Fallback text in case of error
        document.getElementById('song-name').textContent = 'Error';
        document.getElementById('artist-name').textContent = '';
        document.getElementById('album-cover').src = '../assets/images/default-album.jpg';
        document.getElementById('play-time').textContent = 'N/A';
    });