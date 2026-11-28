import { Pool, QueryResult, QueryResultRow } from 'pg';

let pool: Pool | null = null;
let initPromise: Promise<void> | null = null;

function resolveConnectionString(): string | undefined {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.STORAGE_DATABASE_URL,
    process.env.STORAGE_POSTGRES_URL
  ];
  return candidates.find(v => Boolean(v && v.trim().length > 0))?.trim();
}

/**
 * Returns true when a PostgreSQL connection string (Neon, Supabase, or Docker) is configured.
 */
export function isPostgresEnabled(): boolean {
  return Boolean(resolveConnectionString());
}

/**
 * Returns a singleton pg.Pool configured for serverless (Neon/Vercel) or local Docker Postgres.
 */
export function getPgPool(): Pool {
  if (!pool) {
    const connectionString = resolveConnectionString();
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured');
    }
    const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 10000,
      ssl: isLocal ? false : { rejectUnauthorized: false }
    });
  }
  return pool;
}

/**
 * Ensures schema tables exist and initial baseline records are seeded on an empty database.
 */
export async function ensurePostgresSchema(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const db = getPgPool();
      await db.query(`
        CREATE TABLE IF NOT EXISTS patients (
          id TEXT PRIMARY KEY,
          cedula TEXT UNIQUE NOT NULL,
          full_name TEXT NOT NULL,
          age INTEGER NOT NULL,
          blood_type TEXT NOT NULL DEFAULT 'O+',
          allergies TEXT NOT NULL DEFAULT 'Ninguna',
          condition TEXT NOT NULL,
          address TEXT NOT NULL,
          family_contact_name TEXT NOT NULL,
          family_phone TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS clinical_records (
          patient_id TEXT PRIMARY KEY,
          cedula TEXT NOT NULL,
          full_name TEXT NOT NULL,
          age INTEGER NOT NULL,
          blood_type TEXT NOT NULL DEFAULT 'O+',
          allergies TEXT NOT NULL DEFAULT 'Ninguna',
          primary_diagnosis TEXT NOT NULL,
          prescribed_meds TEXT NOT NULL,
          attending_doctor TEXT NOT NULL,
          emergency_contact TEXT NOT NULL,
          special_care_notes TEXT NOT NULL,
          last_updated TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS vital_logs (
          id TEXT PRIMARY KEY,
          patient_id TEXT NOT NULL,
          patient_name TEXT,
          nurse_id TEXT NOT NULL,
          nurse_name TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          bp_systolic INTEGER NOT NULL,
          bp_diastolic INTEGER NOT NULL,
          glucose_mg_dl INTEGER NOT NULL,
          oxygen_saturation INTEGER NOT NULL,
          heart_rate_bpm INTEGER NOT NULL,
          temperature_c REAL NOT NULL,
          medication_administered TEXT NOT NULL,
          nurse_notes TEXT NOT NULL,
          status_flag TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS nurses (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          photo_url TEXT NOT NULL DEFAULT '',
          specialty TEXT NOT NULL,
          rating REAL NOT NULL DEFAULT 5.0,
          phone TEXT NOT NULL,
          experience_years INTEGER NOT NULL,
          is_available BOOLEAN NOT NULL DEFAULT TRUE,
          bio TEXT,
          license_number TEXT NOT NULL DEFAULT 'MSP-EC-PEND',
          credential_status TEXT NOT NULL DEFAULT 'verificada'
        );

        CREATE TABLE IF NOT EXISTS nurse_checkins (
          id TEXT PRIMARY KEY,
          nurse_id TEXT NOT NULL,
          nurse_name TEXT NOT NULL,
          patient_id TEXT NOT NULL,
          patient_name TEXT NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          address TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          status TEXT NOT NULL,
          event_type TEXT NOT NULL DEFAULT 'ingreso'
        );

        CREATE TABLE IF NOT EXISTS bookings (
          id TEXT PRIMARY KEY,
          patient_id TEXT NOT NULL,
          patient_cedula TEXT NOT NULL,
          patient_name TEXT NOT NULL,
          family_phone TEXT NOT NULL,
          service_type TEXT NOT NULL,
          date TEXT NOT NULL,
          shift_hours TEXT NOT NULL,
          status TEXT NOT NULL,
          total_price_usd REAL NOT NULL,
          nurse_payout_usd REAL NOT NULL,
          agency_margin_usd REAL NOT NULL,
          payment_status TEXT NOT NULL DEFAULT 'pendiente',
          payment_method TEXT NOT NULL DEFAULT 'transferencia',
          assigned_nurse_id TEXT,
          assigned_nurse_name TEXT,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS medical_alerts (
          id TEXT PRIMARY KEY,
          patient_id TEXT NOT NULL,
          patient_name TEXT NOT NULL,
          vital_id TEXT NOT NULL,
          severity TEXT NOT NULL,
          message TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          resolved BOOLEAN NOT NULL DEFAULT FALSE,
          resolved_by TEXT,
          resolved_notes TEXT
        );

        CREATE TABLE IF NOT EXISTS reviews (
          id TEXT PRIMARY KEY,
          client_name TEXT NOT NULL,
          relation TEXT NOT NULL,
          photo_url TEXT NOT NULL,
          rating INTEGER NOT NULL,
          comment TEXT NOT NULL,
          date TEXT NOT NULL,
          is_verified BOOLEAN NOT NULL DEFAULT TRUE
        );

        CREATE TABLE IF NOT EXISTS whatsapp_logs (
          id TEXT PRIMARY KEY,
          to_phone TEXT NOT NULL,
          message_text TEXT NOT NULL,
          type TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          status TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS medications (
          id TEXT PRIMARY KEY,
          patient_id TEXT NOT NULL,
          patient_name TEXT NOT NULL,
          medication_name TEXT NOT NULL,
          dosage TEXT NOT NULL,
          route TEXT NOT NULL,
          schedule TEXT NOT NULL,
          prescribed_by TEXT NOT NULL,
          active BOOLEAN NOT NULL DEFAULT TRUE,
          last_administered_at TEXT,
          last_administered_by TEXT,
          administration_logs JSONB NOT NULL DEFAULT '[]'::jsonb
        );

        CREATE TABLE IF NOT EXISTS prescriptions (
          id TEXT PRIMARY KEY,
          patient_id TEXT NOT NULL,
          patient_name TEXT NOT NULL,
          patient_cedula TEXT NOT NULL,
          specialty TEXT NOT NULL,
          cie10_code TEXT NOT NULL,
          cie10_description TEXT NOT NULL,
          items JSONB NOT NULL DEFAULT '[]'::jsonb,
          indications TEXT NOT NULL DEFAULT '',
          doctor_name TEXT NOT NULL,
          doctor_license TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS specialty_records (
          patient_id TEXT PRIMARY KEY,
          odontogram JSONB NOT NULL DEFAULT '{}'::jsonb,
          dental_treatment_plan TEXT NOT NULL DEFAULT '',
          pediatrics JSONB NOT NULL DEFAULT '{}'::jsonb,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS invoices (
          id TEXT PRIMARY KEY,
          invoice_number TEXT NOT NULL,
          sri_access_key TEXT NOT NULL,
          client_document TEXT NOT NULL,
          client_name TEXT NOT NULL,
          client_email TEXT NOT NULL,
          payment_method TEXT NOT NULL,
          items JSONB NOT NULL DEFAULT '[]'::jsonb,
          subtotal_0_usd REAL NOT NULL DEFAULT 0,
          subtotal_15_usd REAL NOT NULL DEFAULT 0,
          iva_usd REAL NOT NULL DEFAULT 0,
          total_usd REAL NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'autorizado',
          issued_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS inventory_items (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          sku TEXT NOT NULL,
          lot_number TEXT NOT NULL,
          expiration_date TEXT NOT NULL,
          stock INTEGER NOT NULL DEFAULT 0,
          min_stock INTEGER NOT NULL DEFAULT 10,
          unit_cost_usd REAL NOT NULL DEFAULT 0,
          unit TEXT NOT NULL DEFAULT 'unidad'
        );

        CREATE TABLE IF NOT EXISTS clinic_appointments (
          id TEXT PRIMARY KEY,
          patient_name TEXT NOT NULL,
          patient_phone TEXT NOT NULL,
          specialty TEXT NOT NULL,
          professional_name TEXT NOT NULL,
          room TEXT NOT NULL,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          reason TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'confirmada'
        );

        CREATE TABLE IF NOT EXISTS erp_users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          full_name TEXT NOT NULL,
          role TEXT NOT NULL,
          specialty TEXT NOT NULL DEFAULT 'General',
          clinic_id TEXT NOT NULL DEFAULT 'clinic-kawsay-hq',
          clinic_name TEXT NOT NULL DEFAULT 'Salud Kawsay Matriz Quito',
          password_hash TEXT NOT NULL,
          active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TEXT NOT NULL
        );

        -- High-scale B-Tree indexes for 10k+ patients & 100k+ clinical transactions
        CREATE INDEX IF NOT EXISTS idx_patients_cedula ON patients (cedula);
        CREATE INDEX IF NOT EXISTS idx_patients_name ON patients (full_name);
        CREATE INDEX IF NOT EXISTS idx_bookings_status_nurse ON bookings (status, assigned_nurse_id);
        CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings (created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_vitals_patient_ts ON vital_logs (patient_id, timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_checkins_ts ON nurse_checkins (timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_medications_patient ON medications (patient_id);
        CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_ts ON prescriptions (patient_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_invoices_doc_ts ON invoices (client_document, issued_at DESC);
        CREATE INDEX IF NOT EXISTS idx_appointments_date_spec ON clinic_appointments (date DESC, specialty, status);
        CREATE INDEX IF NOT EXISTS idx_erp_users_clinic_role ON erp_users (clinic_id, role);
      `);

      // Seed baseline patients & Kardex orders if empty
      const countRes = await db.query('SELECT COUNT(*)::int AS count FROM patients');
      if (countRes.rows[0].count === 0) {
        await db.query(`
          INSERT INTO patients (id, cedula, full_name, age, blood_type, allergies, condition, address, family_contact_name, family_phone)
          VALUES
            ('pat-1', '1712345678', 'Sra. Carmen Rosa Delgado', 82, 'O+', 'Penicilina, Sulfas', 'Hipertensión arterial y asistencia en actividades de vida diaria', 'Av. Coruña 124, Quito', 'Carlos Delgado (Hijo)', '0998765432'),
            ('pat-2', '1798765432', 'Sr. Manuel Fernando Ortiz', 76, 'A+', 'Ninguna conocida', 'Postoperatorio de cadera y curación de heridas', 'Calle Los Alisos N34, Quito', 'Sofía Ortiz (Hija)', '0987654321')
          ON CONFLICT (id) DO NOTHING;

          INSERT INTO medications (id, patient_id, patient_name, medication_name, dosage, route, schedule, prescribed_by, active, administration_logs)
          VALUES
            ('med-101', 'pat-1', 'Sra. Carmen Rosa Delgado', 'Enalapril', '10 mg', 'Oral', 'Cada 12h (08:00 - 20:00)', 'Dr. Fernando Salazar (Cardiología)', TRUE, '[]'::jsonb),
            ('med-102', 'pat-2', 'Sr. Manuel Fernando Ortiz', 'Enoxaparina Sódica', '40 mg / 0.4 ml', 'Subcutánea', 'Cada 24h (09:00 AM)', 'Dra. Patricia Vélez (Traumatología)', TRUE, '[]'::jsonb)
          ON CONFLICT (id) DO NOTHING;
        `);
      }

      const invCountRes = await db.query('SELECT COUNT(*)::int AS count FROM inventory_items');
      if (invCountRes.rows[0].count === 0) {
        await db.query(`
          INSERT INTO inventory_items (id, name, category, sku, lot_number, expiration_date, stock, min_stock, unit_cost_usd, unit)
          VALUES
            ('inv-101', 'Guantes de Nitrilo Estériles (Caja x100)', 'Enfermería', 'ENF-GUA-100', 'LOT-2026-A8', '2027-08-15', 42, 15, 7.50, 'caja'),
            ('inv-102', 'Resina Compuesta Nano-Híbrida A2 (3M)', 'Odontología', 'ODO-RES-A2', 'LOT-2026-D3', '2027-03-20', 8, 5, 28.00, 'jeringa'),
            ('inv-103', 'Suero Fisiológico NaCl 0.9% 500ml', 'General', 'GEN-SUE-500', 'LOT-2026-S1', '2026-12-30', 12, 20, 1.85, 'frasco')
          ON CONFLICT (id) DO NOTHING;
        `);
      }

      const apptCountRes = await db.query('SELECT COUNT(*)::int AS count FROM clinic_appointments');
      if (apptCountRes.rows[0].count === 0) {
        const today = new Date().toISOString().slice(0, 10);
        await db.query(`
          INSERT INTO clinic_appointments (id, patient_name, patient_phone, specialty, professional_name, room, date, time, reason, status)
          VALUES
            ('cit-201', 'Sra. Carmen Rosa Delgado', '0998765432', 'Medicina General', 'Dr. Fernando Salazar', 'Consultorio 1', $1, '09:30', 'Control de presión arterial y ajuste de Enalapril', 'confirmada'),
            ('cit-202', 'Mateo Sebastián Vega', '0984412233', 'Odontología', 'Dra. Valeria Mendoza', 'Sillón Dental A', $1, '11:00', 'Profilaxis y sellantes molares', 'en-sala')
          ON CONFLICT (id) DO NOTHING;
        `, [today]);
      }
    })();
  }
  return initPromise;
}

/**
 * Executes a parameterized PostgreSQL query after ensuring the schema is initialized.
 */
export async function pgQuery<T extends QueryResultRow = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
  await ensurePostgresSchema();
  return getPgPool().query<T>(text, params);
}

/**
 * Computes platform KPIs directly inside PostgreSQL using aggregated SUM/COUNT queries (O(1) payload).
 */
export async function getAggregatedStatsSql() {
  const res = await pgQuery(`
    SELECT
      (SELECT COUNT(*)::int FROM bookings) AS total_bookings,
      (SELECT COUNT(*)::int FROM patients) AS active_patients,
      (SELECT COUNT(*)::int FROM nurses) AS total_nurses,
      (SELECT COUNT(*)::int FROM medical_alerts WHERE resolved = FALSE) AS active_alerts,
      (SELECT COUNT(*)::int FROM reviews) AS total_reviews,
      (SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0)::text FROM reviews) AS avg_rating,
      (SELECT COALESCE(SUM(total_price_usd), 0)::float FROM bookings) AS total_revenue_usd,
      (SELECT COALESCE(SUM(nurse_payout_usd), 0)::float FROM bookings) AS total_nurse_payout_usd,
      (SELECT COUNT(*)::int FROM bookings WHERE status = 'pendiente' OR assigned_nurse_id IS NULL) AS pending_assignments
  `);
  const r = res.rows[0];
  const totalRevenueUSD = Number(r.total_revenue_usd) || 0;
  const totalNursePayoutUSD = Number(r.total_nurse_payout_usd) || 0;
  const netAgencyMarginUSD = Number((totalRevenueUSD - totalNursePayoutUSD).toFixed(2));
  const marginPercentage = totalRevenueUSD > 0 ? ((netAgencyMarginUSD / totalRevenueUSD) * 100).toFixed(1) : '0.0';
  return {
    totalBookings: r.total_bookings,
    activePatients: r.active_patients,
    totalNurses: r.total_nurses,
    activeAlerts: r.active_alerts,
    avgRating: r.avg_rating,
    totalReviews: r.total_reviews,
    totalRevenueUSD,
    totalNursePayoutUSD,
    netAgencyMarginUSD,
    marginPercentage,
    pendingAssignments: r.pending_assignments
  };
}
