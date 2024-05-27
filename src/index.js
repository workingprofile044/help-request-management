document.addEventListener('DOMContentLoaded', () => {
    const ticketsList = document.getElementById('tickets');
    const addTicketButton = document.getElementById('add-ticket-button');
    const addTicketModal = document.getElementById('add-ticket-modal');
    const editTicketModal = document.getElementById('edit-ticket-modal');
    const deleteConfirmationModal = document.getElementById('delete-confirmation-modal');
    const addTicketForm = document.getElementById('add-ticket-form');
    const editTicketForm = document.getElementById('edit-ticket-form');
    const confirmDeleteButton = document.getElementById('confirm-delete-button');
    const cancelDeleteButton = document.getElementById('cancel-delete-button');
    let tickets = [];
    let currentTicketId = null;

    const openModal = (modal) => {
        modal.style.display = 'block';
    };

    const closeModal = (modal) => {
        modal.style.display = 'none';
    };

    const fetchTickets = async () => {
        try {
            const response = await fetch('http://localhost:3000/tickets?method=allTickets');
            tickets = await response.json();
            renderTickets();
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    };

    const renderTickets = () => {
        ticketsList.innerHTML = '';
        tickets.forEach(ticket => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="ticket-body">${ticket.name} - ${ticket.status ? 'Done' : 'Not Done'}</span>
                <div>
                    <button class="edit-button" data-id="${ticket.id}">✎</button>
                    <button class="delete-button" data-id="${ticket.id}">x</button>
                </div>`;
            
            ticketsList.appendChild(li);
        });
        attachEventListeners();
    };

    const attachEventListeners = () => {
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const ticketId = e.target.getAttribute('data-id');
                openEditModal(ticketId);
            });
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const ticketId = e.target.getAttribute('data-id');
                openDeleteModal(ticketId);
            });
        });
    };

    const addTicket = async (ticket) => {
        try {
            const response = await fetch('http://localhost:3000/ticket?method=createTicket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticket)
            });
            const newTicket = await response.json();
            tickets.push(newTicket);
            renderTickets();
        } catch (error) {
            console.error('Error creating ticket:', error);
        }
    };

    const updateTicket = async (ticket) => {
        try {
            const response = await fetch('http://localhost:3000/ticket?method=updateTicket', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticket)
            });
            const updatedTicket = await response.json();
            const index = tickets.findIndex(t => t.id === updatedTicket.id);
            tickets[index] = updatedTicket;
            renderTickets();
        } catch (error) {
            console.error('Error updating ticket:', error);
        }
    };

    const deleteTicket = async (ticketId) => {
        try {
            await fetch(`http://localhost:3000/ticket?method=deleteTicket&id=${ticketId}`, {
                method: 'DELETE'
            });
            tickets = tickets.filter(t => t.id !== ticketId);
            renderTickets();
        } catch (error) {
            console.error('Error deleting ticket:', error);
        }
    };

    const showTicketDetails = async (ticketId) => {
        try {
            const response = await fetch(`http://localhost:3000/ticket?method=ticketById&id=${ticketId}`);
            const ticket = await response.json();
            alert(`Name: ${ticket.name}\nDescription: ${ticket.description}\nStatus: ${ticket.status ? 'Done' : 'Not Done'}`);
        } catch (error) {
            console.error('Error fetching ticket details:', error);
        }
    };

    const openEditModal = (ticketId) => {
        const ticket = tickets.find(t => t.id === ticketId);
        document.getElementById('edit-name').value = ticket.name;
        document.getElementById('edit-description').value = ticket.description;
        document.getElementById('edit-status').checked = ticket.status;
        document.getElementById('edit-id').value = ticket.id;
        openModal(editTicketModal);
    };

    const openDeleteModal = (ticketId) => {
        currentTicketId = ticketId;
        openModal(deleteConfirmationModal);
    };

    const setupModalHandlers = () => {
        addTicketButton.addEventListener('click', () => openModal(addTicketModal));

        addTicketForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('add-name').value;
            const description = document.getElementById('add-description').value;
            const status = document.getElementById('add-status').checked;
            addTicket({ name, description, status });
            closeModal(addTicketModal);
            addTicketForm.reset();
        });

        confirmDeleteButton.addEventListener('click', () => {
            deleteTicket(currentTicketId);
            closeModal(deleteConfirmationModal);
        });

        cancelDeleteButton.addEventListener('click', () => closeModal(deleteConfirmationModal));

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) closeModal(e.target);
        });
    };

    setupModalHandlers();
    fetchTickets();
});
