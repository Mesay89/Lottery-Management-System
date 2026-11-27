'use strict';

const Ticket = require('../models/Ticket');
const LotteryEvent = require('../models/LotteryEvent');
const Winner = require('../models/Winner');
const Result = require('../models/Result');

/**
 * Randomly select winning tickets from a pool of valid tickets for an event.
 * @param {string} eventId
 * @param {number} numberOfWinners
 * @returns {Promise<Array>} selected winning tickets
 */
const selectWinningTickets = async (eventId, numberOfWinners) => {
  const tickets = await Ticket.find({ lotteryEvent: eventId, status: 'Valid' }).lean();
  if (tickets.length === 0) throw new Error('No valid tickets found for this event.');
  if (tickets.length < numberOfWinners) {
    numberOfWinners = tickets.length;
  }

  // Fisher-Yates shuffle
  const shuffled = [...tickets];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, numberOfWinners);
};

/**
 * Identify and persist winner records after a draw is completed.
 * @param {Object} draw - Draw document
 * @param {Object} result - Result document
 * @param {Object} event - LotteryEvent document
 */
const identifyAndPersistWinners = async (draw, result, event) => {
  const prizeStructure = event.prizeStructure || [];
  const winners        = [];

  for (let i = 0; i < draw.winningTickets.length; i++) {
    const ticketId = draw.winningTickets[i];
    const ticket   = await Ticket.findById(ticketId);
    if (!ticket) continue;

    const prize = prizeStructure.find((p) => p.rank === i + 1) || prizeStructure[prizeStructure.length - 1];

    // Update ticket as winner
    ticket.isWinner    = true;
    ticket.prizeRank   = i + 1;
    ticket.prizeAmount = prize ? prize.amount : 0;
    await ticket.save();

    // Create Winner record if not exists
    const existing = await Winner.findOne({ ticket: ticket._id, lotteryEvent: event._id });
    if (!existing) {
      const winner = await Winner.create({
        lotteryEvent:       event._id,
        result:             result._id,
        ticket:             ticket._id,
        customer:           ticket.owner,
        prizeRank:          i + 1,
        prizeAmount:        prize ? prize.amount : 0,
        currency:           event.currency || 'ETB',
        verificationStatus: 'Pending',
        claimStatus:        'Unclaimed',
      });
      winners.push(winner);
    }
  }
  return winners;
};

module.exports = { selectWinningTickets, identifyAndPersistWinners };
