import { Router } from "express"

import { DeliveryLogsController } from "@/controllers/delivery-logs-controller"

import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"
import { verifyUserAuthorization } from "@/middlewares/verifyUserAuthorization"

const deliveryLogsRoutes = Router()
const deliveryLogsController = new DeliveryLogsController()

deliveryLogsRoutes.post(
    "/",
    ensureAuthenticated,
    verifyUserAuthorization(["customer"]),
    deliveryLogsController.create
)

deliveryLogsRoutes.get(
    "/:delivery_id/show",
    ensureAuthenticated,
    verifyUserAuthorization(["customer", "sale"]),
    deliveryLogsController.show
)

export { deliveryLogsRoutes }