// helpers/eventHelpers.js
const { RRule } = require('rrule');
const { Event, EventType, RecurrencePattern } = require('../models'); // Adjust the path as needed

const ID_OFFSET = 1000000; // Starting ID for generated recurring events

const computeRecurringEventInstances = async (currentDate, futureDate) => {
    const recurringEvents = await Event.findAll({
        where: {
            recurring: true
        },
        include: [{
            model: RecurrencePattern,
            as: 'RecurrencePattern',
            required: true
        },
        {
            model: EventType,  // Include event type
            as: 'EventType'
        }]
    });

    const generatedEvents = [];
    let counter = 1; // Counter for incrementing IDs

    for (const event of recurringEvents) {
        const { frequency, interval, customRule, endDate: recurrenceEndDate } = event.RecurrencePattern;
        const originalStartDate = new Date(event.startDate);
        const originalEndDate = new Date(event.endDate);
        const eventDuration = originalEndDate - originalStartDate;
        const recurrenceEnd = new Date(recurrenceEndDate || futureDate);

        // Start generating recurrences after the original event's end date
        let nextStartDate = new Date(originalEndDate);
        nextStartDate.setSeconds(nextStartDate.getSeconds() + 1); // Ensure it's strictly after the original

        if (frequency === 'custom' && customRule) {
            // Generate occurrences using rrule.js for custom rules
            const rule = RRule.fromString(customRule);
            const occurrences = rule.between(currentDate, recurrenceEnd);

            for (const occurrence of occurrences) {
                if (occurrence > originalEndDate) {
                    const start = new Date(occurrence);
                    const end = new Date(occurrence.getTime() + eventDuration);

                    generatedEvents.push({
                        ...event.dataValues,
                        id: ID_OFFSET + counter++, // Unique integer ID offset to avoid conflicts
                        originalEventId: event.id, // Reference to the original event ID
                        startDate: start,
                        endDate: end,
                        isRecurring: true
                    });
                }
            }
        } else {
            // Standard recurrence logic
            while (nextStartDate <= futureDate && nextStartDate <= recurrenceEnd) {
                if (nextStartDate > originalEndDate && nextStartDate >= currentDate) {
                    const start = new Date(nextStartDate);
                    const end = new Date(nextStartDate.getTime() + eventDuration);

                    generatedEvents.push({
                        ...event.dataValues,
                        id: ID_OFFSET + counter++, // Unique integer ID offset to avoid conflicts
                        originalEventId: event.id, // Reference to the original event ID
                        startDate: start,
                        endDate: end,
                        isRecurring: true
                    });
                }

                // Increment nextStartDate based on the frequency and interval
                switch (frequency) {
                    case 'daily':
                        nextStartDate.setDate(nextStartDate.getDate() + interval);
                        break;
                    case 'weekly':
                        nextStartDate.setDate(nextStartDate.getDate() + interval * 7);
                        break;
                    case 'monthly':
                        nextStartDate.setMonth(nextStartDate.getMonth() + interval);
                        break;
                    case 'yearly':
                        nextStartDate.setFullYear(nextStartDate.getFullYear() + interval);
                        break;
                    default:
                        throw new Error('Unsupported recurrence frequency');
                }
            }
        }
    }

    return generatedEvents;
};

module.exports = { computeRecurringEventInstances };
