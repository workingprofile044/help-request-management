const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const { v4: uuidv4 } = require('uuid');

const app = new Koa();
const router = new Router();

app.use(cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type'],
}));

app.use(bodyParser());

let tickets = [
    { id: uuidv4(), name: 'Sample Ticket 1', description: 'Description for ticket 1', status: false, created: Date.now() },
    { id: uuidv4(), name: 'Sample Ticket 2', description: 'Description for ticket 2', status: true, created: Date.now() }
];

router.get('/', (ctx) => {
    ctx.body = 'Help Request Management API';
});

router.get('/tickets', (ctx) => {
    ctx.body = tickets.map(({ id, name, status, created }) => ({ id, name, status, created }));
});

router.get('/ticket', (ctx) => {
    const { id, method } = ctx.query;
    if (method === 'ticketById' && id) {
        const ticket = tickets.find(t => t.id === id);
        if (ticket) {
            ctx.body = ticket;
        } else {
            ctx.status = 404;
            ctx.body = { error: 'Ticket not found' };
        }
    } else {
        ctx.status = 400;
        ctx.body = { error: 'Invalid request' };
    }
});

router.post('/ticket', (ctx) => {
    const { method } = ctx.query;
    if (method === 'createTicket') {
        const { name, description, status } = ctx.request.body;
        const newTicket = {
            id: uuidv4(),
            name,
            description,
            status: !!status,
            created: Date.now()
        };
        tickets.push(newTicket);
        ctx.body = newTicket;
    } else {
        ctx.status = 400;
        ctx.body = { error: 'Invalid request' };
    }
});

router.put('/ticket', (ctx) => {
    const { id, name, description, status } = ctx.request.body;
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
        ticket.name = name;
        ticket.description = description;
        ticket.status = !!status;
        ctx.body = ticket;
    } else {
        ctx.status = 404;
        ctx.body = { error: 'Ticket not found' };
    }
});

router.delete('/ticket', (ctx) => {
    const { id } = ctx.query;
    const index = tickets.findIndex(t => t.id === id);
    if (index !== -1) {
        tickets.splice(index, 1);
        ctx.body = { message: 'Ticket deleted' };
    } else {
        ctx.status = 404;
        ctx.body = { error: 'Ticket not found' };
    }
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
