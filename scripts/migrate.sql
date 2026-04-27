-- ============================================
-- Tabla de leads - Google Ads Lead Form Webhook
-- Ejecutar en Supabase Dashboard > SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS leads (
  id               BIGSERIAL PRIMARY KEY,
  lead_id_google   TEXT NOT NULL UNIQUE,
  fecha_recibido   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  nombre           TEXT,
  email            TEXT,
  telefono         TEXT,
  tipo_propiedad   TEXT,
  metros_cuadrados TEXT,
  plazo            TEXT,
  region           TEXT,
  campaign_id      TEXT,
  gcl_id           TEXT,
  raw_payload      JSONB NOT NULL,
  estado           TEXT NOT NULL DEFAULT 'nuevo'
    CHECK (estado IN ('nuevo','contactado','cotizado','cerrado','descartado')),
  is_test          BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_estado ON leads(estado);
CREATE INDEX IF NOT EXISTS idx_leads_fecha ON leads(fecha_recibido);
CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads(campaign_id);

-- Habilitar RLS (Row Level Security) para proteger la tabla
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: solo el service_role puede acceder (desde serverless functions)
CREATE POLICY "Service role full access" ON leads
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
