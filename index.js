const cron = require('node-cron');
const nodemailer = require('nodemailer');
const axios = require('axios');
const dayjs = require('dayjs');
const dotenv = require('dotenv').config();

// Configuração do nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  secure: true,
  port: 465,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY,
  },
});

// Função para obter dados da API com data e hora dinâmicas
const fetchData = async () => {
  const timestamp = dayjs().toISOString();
  const url = `https://www.simcompanies.com/api/v2/market-ticker/1/${timestamp}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter dados da API:', error);
  }
};

// Função para enviar email
const sendEmail = async (data) => {
  const mailOptions = {
    from: 'seu-email@gmail.com',
    to: 'destinatario-email@gmail.com',
    subject: 'Dados da API',
    text: `Dados obtidos da API: ${JSON.stringify(data)}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email enviado com sucesso');
  } catch (error) {
    console.error('Erro ao enviar email:', error);
  }
};

// Cron job configurado para rodar a cada hora
cron.schedule('0 * * * *', async () => {
  const data = await fetchData();
  if (data) {
    await sendEmail(data);
  }
});

// Export necessário para Vercel
module.exports = (req, res) => {
  res.status(200).send('Cron job configurado!');
};
