"use strict";

/**
 * ticket controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::ticket.ticket", ({ strapi }) => ({
  async create(ctx) {
    try {
      const body = ctx.request.body;
      console.log(body);

      const seatsToReserve = body.data.seats;
      console.log(seatsToReserve); //nb de places demandées

      const categoryToReserve = body.data.category;
      console.log(categoryToReserve); //orchestre

      const keyOfEvent = ctx.request.body.data.event;
      console.log(keyOfEvent); //1

      const eventToReserve = await strapi.entityService.findOne(
        "api::event.event",
        keyOfEvent
      );
      console.log(eventToReserve);

      let seatsOfOchestre = eventToReserve.seats.orchestre;
      console.log(seatsOfOchestre); //1164

      let seatsOfMezzanie = eventToReserve.seats.mezzanine;
      console.log(seatsOfMezzanie); //824

      console.log(categoryToReserve);
      const cat1OfEvent = eventToReserve.seats;
      console.log(cat1OfEvent);

      const catOrchestre = Object.keys(cat1OfEvent)[0];

      console.log(catOrchestre);

      if (categoryToReserve === catOrchestre) {
        if (seatsToReserve <= seatsOfOchestre) {
          seatsOfOchestre = seatsOfOchestre - seatsToReserve;
          await super.create(ctx);
          await strapi.entityService.update("api::event.event", keyOfEvent, {
            data: {
              seats: {
                orchestre: seatsOfOchestre,
                mezzanine: seatsOfMezzanie,
              },
            },
          });
        } else {
          ctx.response.status = 400;
          return { message: "plus de places disponibles" };
        }
      } else if (seatsToReserve <= seatsOfMezzanie) {
        seatsOfMezzanie = seatsOfMezzanie - seatsToReserve;
        await super.create(ctx);
        await strapi.entityService.update("api::event.event", keyOfEvent, {
          data: {
            seats: {
              orchestre: seatsOfOchestre,
              mezzanine: seatsOfMezzanie,
            },
          },
        });
      } else {
        ctx.response.status = 400;
        return { message: "plus de places disponibles" };
      }
      const { meta, data } = await super.create(ctx); // variable pour reponse au client dans postMan

      console.log(seatsOfOchestre);
      console.log(seatsOfMezzanie);

      return { meta, data }; //reponse au client dans postMan
    } catch (error) {
      ctx.response.status = 500;
      return { message: error.message };
    }
  },
}));
