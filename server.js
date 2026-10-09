require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./db/connect');
const placesRoutes = require('./routes/places');
const reviewsRoutes = require('./routes/reviews');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Carregar documentação Swagger (arquivo Swagger.json na raiz)
let swaggerDocument = {};
try {
  swaggerDocument = require('./Swagger.json');
} catch (error) {
  console.warn('Swagger.json not yet populated or invalid JSON.');
}

const app = express();

// Middlewares essenciais
app.use(cors());
app.use(express.json());

// Rota raiz de teste / status
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Explore Mozambique API',
    docs: '/api-docs'
  });
});

// Documentação Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'Explore Mozambique API - Docs',
  swaggerOptions: { displayRequestDuration: true }
}));
// Raw OpenAPI file
app.get('/Swagger.json', (req, res) => res.json(swaggerDocument));

// Health check: shows which database the running server is connected to (no credentials)
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  res.status(200).json({
    success: true,
    status: 'ok',
    database: mongoose.connection.name,
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Rotas da API
app.use('/places', placesRoutes);
app.use('/reviews', reviewsRoutes);

// Middlewares de Erro (devem ficar sempre após as rotas)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Conectar ao MongoDB antes de iniciar o servidor HTTP
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger Docs available at: /api-docs (port ${PORT})`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();