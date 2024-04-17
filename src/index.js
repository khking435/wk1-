document.addEventListener('DOMContentLoaded', function() {
    // Base URL for films
    const baseURL = "http://localhost:3000/films";
    // Get the films list ul element
    let filmUl = document.getElementById("films");

    // Function to check ticket and update it
    function checkTicket(film) {
        fetch(`${baseURL}/${film.id}`, {
            method: 'PATCH',
            headers: {"Content-type": "application/json"},
            body: JSON.stringify({
                tickets_sold: film.tickets_sold
            })
        })
        .then(response => response.json())
        .catch(error => console.error('Error updating ticket:', error));
    }

    // Function to delete a film
    function deleteFilm(film){
        fetch(`${baseURL}/${film.id}`, { method: 'DELETE' })
        .then(() => {
            filmUl.removeChild(film.li);
        })
        .catch(error => console.error('Error deleting film:', error));
    }

    // Function to create or update a ticket
    function createOrUpdateTicket(filmId, numberOfTickets) {
        fetch(`${baseURL}/${filmId}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.id) {
                // Ticket already exists, update the number_of_tickets
                fetch(`${baseURL}/${filmId}`, {
                    method: 'PATCH',
                    headers: {"Content-type": "application/json"},
                    body: JSON.stringify({
                        tickets_sold: data.tickets_sold + numberOfTickets
                    })
                })
                .then(response => response.json())
                .then(updatedData => console.log("Ticket updated:", updatedData))
                .catch(error => console.error('Error updating ticket:', error));
            } else {
                // Ticket does not exist, create a new one
                fetch(baseURL, {
                    method: 'POST',
                    headers: {"Content-type": "application/json"},
                    body: JSON.stringify({
                        film_id: filmId,
                        number_of_tickets: numberOfTickets
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to create ticket');
                    }
                    return response.json();
                })
                .then(newData => console.log("New ticket created:", newData))
                .catch(error => console.error('Error creating ticket:', error));
            }
        })
        .catch(error => console.error('Error fetching film:', error));
    }

    // Fetch films data
    fetch(baseURL)
    .then(response => response.json()) 
    .then(data => {
        // Iterate through each film
        data.forEach(film => {
            // Create list item for the film
            let filmLi = document.createElement('li');
            filmLi.className = "film";

            // Create span element for film title
            let titleEl = document.createElement('span'); 
            titleEl.textContent = film.title;

            // If the title is a string, add a delete button
            if (typeof film.title === 'string') {
                let deleteBtn = document.createElement('button');
                deleteBtn.textContent = "Delete"
                deleteBtn.id = 'deleteContent'
                titleEl.appendChild(deleteBtn);

                deleteBtn.addEventListener('click',() => {
                    titleEl.remove()
                    deleteFilm(film)
                });
            }

            // Append title to list item
            filmLi.appendChild(titleEl);
            // Append list item to films list
            filmUl.appendChild(filmLi);

            // Add class 'sold-out' if tickets_sold is 0
            if (film.tickets_sold === 0) {
                titleEl.classList.add('sold-out');
            }

            // Add event listener for film title click
            titleEl.addEventListener("click", () => {
                // Display film details
                let moviePoster = document.createElement("img");
                let position = document.getElementById("posterPosition");
                position.innerHTML = "";

                moviePoster.src = film.poster;
                position.appendChild(moviePoster);

                let movieTitle = document.getElementById("title");
                movieTitle.textContent = film.title;

                let runTime = document.getElementById("runtime");
                runTime.textContent = `${film.runtime} minutes`;

                let movieDescription = document.getElementById("film-info");
                movieDescription.textContent = film.description;

                let showTime = document.getElementById("showtime");
                showTime.textContent = film.showtime;

                let ticket = document.getElementById("ticket-num");
                ticket.textContent = film.tickets_sold;

                let btn = document.getElementById("buy-ticket");
                btn.disabled = film.tickets_sold <= 0; // Disable button if tickets are sold out
                btn.textContent = film.tickets_sold <= 0 ? "Sold Out" : "Buy Ticket";

                // Add event listener for buy ticket button click
                btn.addEventListener("click", () => {
                    // If tickets are available, decrement tickets_sold and update ticket
                    if (film.tickets_sold > 0) {
                        film.tickets_sold--;
                        ticket.textContent = film.tickets_sold;
                        checkTicket(film);
                        btn.disabled = film.tickets_sold <= 0; // Disable button if tickets become sold out
                        btn.textContent = film.tickets_sold <= 0 ? "Sold Out" : "Buy Ticket";
                        // Create or update a ticket entry
                        createOrUpdateTicket(film.id, 1);
                    }
                    //  Check if tickets are sold out and add/remove sold-out class accordingly
                    if (film.tickets_sold === 0) {
                        btn.textContent = "Sold Out";
                        btn.disabled = true;
                        titleEl.classList.add('sold-out'); // Add class if tickets are sold out
                    } else {
                        btn.textContent = "Buy Ticket";
                        btn.disabled = false;
                        titleEl.classList.remove('sold-out'); // Remove class if tickets are not sold out
                    }
                });
            });
        });
    })
    .catch(error => console.error('Error fetching films:', error));
});
