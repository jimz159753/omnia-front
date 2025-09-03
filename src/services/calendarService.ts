import axios, { AxiosInstance, AxiosResponse } from "axios";

// Types based on Cal.com API documentation
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  length: number;
  slug: string;
  hidden: boolean;
  locations: unknown[];
  customInputs: unknown[];
  eventName?: string;
  hashedLink?: string;
  bookingFields?: unknown[];
  successRedirectUrl?: string;
  teamId?: number;
  userId?: number;
  profileId?: number;
  schedulingType?: string;
  active?: boolean;
  metadata?: Record<string, unknown>;
  timeZone?: string;
  scheduleId?: number;
  availability?: unknown[];
  price?: number;
  currency?: string;
  seatsPerTimeSlot?: number;
  seatsShowAttendees?: boolean;
  recurringEvent?: unknown;
  requiresConfirmation?: boolean;
  disableGuests?: boolean;
  hideCalendarNotes?: boolean;
  minimumBookingNotice?: number;
  beforeEventBuffer?: number;
  afterEventBuffer?: number;
  slotInterval?: number;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  length: number;
  slug?: string;
  hidden?: boolean;
  locations?: unknown[];
  customInputs?: unknown[];
  eventName?: string;
  hashedLink?: string;
  bookingFields?: unknown[];
  successRedirectUrl?: string;
  teamId?: number;
  userId?: number;
  profileId?: number;
  schedulingType?: string;
  active?: boolean;
  metadata?: Record<string, unknown>;
  timeZone?: string;
  scheduleId?: number;
  availability?: unknown[];
  price?: number;
  currency?: string;
  seatsPerTimeSlot?: number;
  seatsShowAttendees?: boolean;
  recurringEvent?: unknown;
  requiresConfirmation?: boolean;
  disableGuests?: boolean;
  hideCalendarNotes?: boolean;
  minimumBookingNotice?: number;
  beforeEventBuffer?: number;
  afterEventBuffer?: number;
  slotInterval?: number;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string;
}

export interface CalendarServiceConfig {
  baseURL: string;
  bearerToken: string;
}

class CalendarService {
  private api: AxiosInstance | null = null;
  private config: CalendarServiceConfig | null = null;

  private initialize() {
    if (this.api && this.config) {
      return; // Already initialized
    }

    this.config = {
      baseURL: process.env.CAL_BASE_URL || "",
      bearerToken: process.env.CAL_BEARER_TOKEN || "",
    };

    // Only validate in production or when explicitly required
    if (process.env.NODE_ENV === "production") {
      if (!this.config.baseURL) {
        throw new Error("CAL_BASE_URL environment variable is required");
      }

      if (!this.config.bearerToken) {
        throw new Error("CAL_BEARER_TOKEN environment variable is required");
      }
    }

    this.api = axios.create({
      baseURL: this.config.baseURL,
      headers: {
        Authorization: `Bearer ${this.config.bearerToken}`,
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10 seconds timeout
    });

    // Add request interceptor for logging (optional)
    this.api.interceptors.request.use(
      (config) => {
        console.log(
          `[Calendar Service] ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error) => {
        console.error("[Calendar Service] Request error:", error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error(
          "[Calendar Service] Response error:",
          error.response?.data || error.message
        );
        return Promise.reject(error);
      }
    );
  }

  // Get all event types (Cal.com API)
  async getEvents(): Promise<CalendarEvent[]> {
    try {
      this.initialize();

      // Check if we have valid configuration
      if (!this.config!.baseURL || !this.config!.bearerToken) {
        throw new Error("Calendar service not configured");
      }

      const response = await this.api!.get("/event-types", {
        headers: {
          "cal-api-version": "2024-08-14",
        },
        params: {
          username: process.env.CAL_USERNAME,
        },
      });
      return response.data.data.eventTypeGroups;
    } catch (error) {
      console.error("Failed to fetch event types:", error);
      throw error;
    }
  }

  // Get event type by ID (Cal.com API)
  async getEventById(id: string): Promise<CalendarEvent> {
    try {
      this.initialize();
      const response = await this.api!.get(`/event-types/${id}`, {
        headers: {
          "cal-api-version": "2024-08-14",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch event type ${id}:`, error);
      throw error;
    }
  }

  // Create new event type (Cal.com API)
  async createEvent(eventData: CreateEventRequest): Promise<CalendarEvent> {
    try {
      this.initialize();
      const response = await this.api!.post("/event-types", eventData, {
        headers: {
          "cal-api-version": "2024-08-14",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to create event type:", error);
      throw error;
    }
  }

  // Update existing event type (Cal.com API)
  async updateEvent(eventData: UpdateEventRequest): Promise<CalendarEvent> {
    try {
      this.initialize();
      const { id, ...updateData } = eventData;
      const response = await this.api!.put(`/event-types/${id}`, updateData, {
        headers: {
          "cal-api-version": "2024-08-14",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to update event type ${eventData.id}:`, error);
      throw error;
    }
  }

  // Delete event type (Cal.com API)
  async deleteEvent(id: string): Promise<void> {
    try {
      this.initialize();
      await this.api!.delete(`/event-types/${id}`, {
        headers: {
          "cal-api-version": "2024-08-14",
        },
      });
    } catch (error) {
      console.error(`Failed to delete event type ${id}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const calendarService = new CalendarService();

// Export the class for testing or custom instances
export default CalendarService;
