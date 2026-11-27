'use strict';

const Notification = require('../models/Notification');
const User         = require('../models/User');
const Winner       = require('../models/Winner');
const LotteryEvent = require('../models/LotteryEvent');
const PrizeClaim   = require('../models/PrizeClaim');
const emailService = require('./email.service');

/**
 * Create an in-app notification for a user.
 */
const createInAppNotification = async (userId, title, message, data = {}, eventId = null) => {
  return Notification.create({
    recipient:    userId,
    type:         'in_app',
    title,
    message,
    data,
    status:       'Sent',
    sentAt:       new Date(),
    lotteryEvent: eventId || undefined,
  });
};

/**
 * Send an email notification and record it.
 */
const sendEmailNotification = async (userId, subject, message, data = {}) => {
  const user = await User.findById(userId);
  if (!user || !user.email) return;

  await emailService.sendMail?.({ to: user.email, subject, html: `<p>${message}</p>` }).catch(() => {});

  return Notification.create({
    recipient: userId,
    type:      'email',
    title:     subject,
    message,
    data,
    status:    'Sent',
    sentAt:    new Date(),
  });
};

/**
 * Notify all ticket holders when results are published for an event.
 */
const notifyResultPublished = async (eventId) => {
  const event = await LotteryEvent.findById(eventId);
  if (!event) return;

  const Ticket = require('../models/Ticket');
  const tickets = await Ticket.find({ lotteryEvent: eventId, owner: { $exists: true } })
    .distinct('owner');

  const promises = tickets.map(async (userId) => {
    const user = await User.findById(userId);
    if (!user) return;

    await createInAppNotification(
      userId,
      `Results Published: ${event.name}`,
      `The lottery draw results for "${event.name}" have been published. Check your tickets now!`,
      { eventId },
      eventId
    );

    await emailService.sendResultsPublishedEmail(user, event).catch(() => {});
  });

  await Promise.allSettled(promises);
};

/**
 * Notify all winners for an event.
 */
const notifyWinners = async (eventId) => {
  const event   = await LotteryEvent.findById(eventId);
  const winners = await Winner.find({ lotteryEvent: eventId }).populate('customer');

  const promises = winners.map(async (winner) => {
    if (!winner.customer) return;
    const user = winner.customer;

    await createInAppNotification(
      user._id,
      `🎉 You Won! – ${event ? event.name : 'Lottery'}`,
      `Congratulations! You won Rank ${winner.prizeRank} prize of ETB ${winner.prizeAmount.toLocaleString()}. Please submit your claim.`,
      { winnerId: winner._id, eventId },
      eventId
    );

    if (event) {
      await emailService.sendWinnerNotificationEmail(user, winner, event).catch(() => {});
    }
  });

  await Promise.allSettled(promises);
};

/**
 * Notify customer of a prize claim status update.
 */
const notifyClaimUpdate = async (claimId) => {
  const claim = await PrizeClaim.findById(claimId).populate('customer');
  if (!claim || !claim.customer) return;

  const user = claim.customer;
  await createInAppNotification(
    user._id,
    `Claim Update: ${claim.claimReference}`,
    `Your prize claim ${claim.claimReference} status has been updated to: ${claim.status}.`,
    { claimId: claim._id }
  );

  await emailService.sendPrizeClaimUpdateEmail(user, claim).catch(() => {});
};

module.exports = {
  createInAppNotification,
  sendEmailNotification,
  notifyResultPublished,
  notifyWinners,
  notifyClaimUpdate,
};
