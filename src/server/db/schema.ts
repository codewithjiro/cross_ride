// CrossRide Database Schema
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  varchar,
  text,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `cross_ride_${name}`);

// Enums
export const vanStatusEnum = pgEnum("van_status", [
  "active",
  "maintenance",
  "inactive",
]);
export const driverStatusEnum = pgEnum("driver_status", [
  "active",
  "on_leave",
  "inactive",
]);
export const tripStatusEnum = pgEnum("trip_status", [
  "pending",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "approved",
  "completed",
  "rejected",
  "cancelled",
]);
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

// Users Table - Store basic user info
export const users = createTable(
  "user",
  (d) => ({
    id: d.varchar({ length: 255 }).primaryKey(), // UUID
    email: d.varchar({ length: 255 }).notNull().unique(),
    password: d.varchar({ length: 255 }).notNull(), // Hashed password
    firstName: d.varchar({ length: 255 }),
    lastName: d.varchar({ length: 255 }),
    phoneNumber: d.varchar({ length: 20 }),
    profileImage: d.varchar({ length: 500 }), // Uploadthing URL
    role: userRoleEnum("role").default("user").notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).defaultNow(),
  }),
  (t) => [index("email_idx").on(t.email), index("role_idx").on(t.role)],
);

// Vans Table
export const vans = createTable(
  "van",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 255 }).notNull(),
    plateNumber: d.varchar({ length: 20 }).notNull().unique(),
    capacity: d.integer().notNull(),
    status: vanStatusEnum("status").default("active").notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).defaultNow(),
  }),
  (t) => [
    index("van_plate_idx").on(t.plateNumber),
    index("van_status_idx").on(t.status),
  ],
);

// Drivers Table
export const drivers = createTable(
  "driver",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 255 }).notNull(),
    email: d.varchar({ length: 255 }).notNull().unique(),
    phoneNumber: d.varchar({ length: 20 }).notNull(),
    licenseNumber: d.varchar({ length: 50 }).notNull().unique(),
    status: driverStatusEnum("status").default("active").notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).defaultNow(),
  }),
  (t) => [
    index("driver_email_idx").on(t.email),
    index("driver_status_idx").on(t.status),
  ],
);

// Trips Table
export const trips = createTable(
  "trip",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    vanId: d
      .integer()
      .notNull()
      .references(() => vans.id),
    driverId: d
      .integer()
      .notNull()
      .references(() => drivers.id),
    route: d.varchar({ length: 255 }).notNull(),
    departureTime: d.timestamp({ withTimezone: true }).notNull(),
    arrivalTime: d.timestamp({ withTimezone: true }).notNull(),
    seatsAvailable: d.integer().notNull(),
    seatsReserved: d.integer().default(0).notNull(),
    status: tripStatusEnum("status").default("scheduled").notNull(),
    cancelReason: d.text(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).defaultNow(),
  }),
  (t) => [
    index("trip_van_idx").on(t.vanId),
    index("trip_driver_idx").on(t.driverId),
    index("trip_status_idx").on(t.status),
    index("trip_departure_idx").on(t.departureTime),
  ],
);

// Bookings Table
export const bookings = createTable(
  "booking",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    tripId: d
      .integer()
      .notNull()
      .references(() => trips.id),
    seatsBooked: d.integer().notNull(),
    department: d.varchar({ length: 255 }),
    status: bookingStatusEnum("status").default("pending").notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).defaultNow(),
  }),
  (t) => [
    index("booking_user_idx").on(t.userId),
    index("booking_trip_idx").on(t.tripId),
    index("booking_status_idx").on(t.status),
  ],
);

// Admin Logs Table
export const adminLogs = createTable(
  "admin_log",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    adminId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    action: d.varchar({ length: 255 }).notNull(),
    entityType: d.varchar({ length: 50 }).notNull(), // "van", "driver", "trip", "booking"
    entityId: d.varchar({ length: 255 }).notNull(),
    changes: d.text(), // JSON string of what changed
    description: d.text(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [
    index("log_admin_idx").on(t.adminId),
    index("log_entity_idx").on(t.entityType),
    index("log_date_idx").on(t.createdAt),
  ],
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  adminLogs: many(adminLogs),
}));

export const vansRelations = relations(vans, ({ many }) => ({
  trips: many(trips),
}));

export const driversRelations = relations(drivers, ({ many }) => ({
  trips: many(trips),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  van: one(vans, {
    fields: [trips.vanId],
    references: [vans.id],
  }),
  driver: one(drivers, {
    fields: [trips.driverId],
    references: [drivers.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  trip: one(trips, {
    fields: [bookings.tripId],
    references: [trips.id],
  }),
}));

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminLogs.adminId],
    references: [users.id],
  }),
}));
