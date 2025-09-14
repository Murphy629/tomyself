/* schema.sql */
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Ensure DB exists; comment out if you already selected sepdb in CLI
CREATE DATABASE IF NOT EXISTS sepdb CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE sepdb;

-- ---------- Users ----------
CREATE TABLE IF NOT EXISTS users (
  id               CHAR(36)      NOT NULL PRIMARY KEY DEFAULT (UUID()),
  email            VARCHAR(320)  UNIQUE,
  username         VARCHAR(64)   UNIQUE,
  avatar           TEXT,
  description      TEXT,
  influx_user_id   VARCHAR(128),

  -- Suspension flags
  is_active        BOOLEAN       NOT NULL DEFAULT TRUE,
  suspended_at     DATETIME      NULL,
  suspended_by     CHAR(36)      NULL,
  suspension_reason TEXT,

  -- Signup & auth state
  signup_time      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Timestamps
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at    DATETIME      NULL,

  CONSTRAINT fk_users_suspended_by FOREIGN KEY (suspended_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- MFA Factors ----------
CREATE TABLE IF NOT EXISTS mfa_factors (
  id            CHAR(36)    NOT NULL PRIMARY KEY DEFAULT (UUID()),
  user_id       CHAR(36)    NOT NULL,
  type          VARCHAR(32) NOT NULL, -- totp | backup_code | webauthn | etc.
  secret_hash   VARCHAR(255) NOT NULL, -- store hashed/encrypted, never plaintext
  label         VARCHAR(128),
  created_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at  DATETIME    NULL,
  revoked_at    DATETIME    NULL,
  mfa_enabled   BOOLEAN     NOT NULL DEFAULT FALSE,
  INDEX idx_mfa_user_type (user_id, type),
  CONSTRAINT fk_mfa_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Organizations & membership ----------
CREATE TABLE IF NOT EXISTS organizations (
  id          CHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  created_at  DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS organization_members (
  id               CHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  organization_id  CHAR(36)   NOT NULL,
  user_id          CHAR(36)   NOT NULL,
  role             VARCHAR(64),
  status           VARCHAR(32), -- invited | active | removed
  joined_at        DATETIME,
  UNIQUE KEY uk_org_user (organization_id, user_id),
  CONSTRAINT fk_org_members_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_org_members_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Org -> measurement mapping ----------
CREATE TABLE IF NOT EXISTS org_measurements (
  id               CHAR(36)    NOT NULL PRIMARY KEY DEFAULT (UUID()),
  organization_id  CHAR(36)    NOT NULL,
  measurement      VARCHAR(255) NOT NULL, -- canonical Influx _measurement
  description      TEXT,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_org_measurement (organization_id, measurement),
  CONSTRAINT fk_org_meas_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Fields (per measurement) ----------
CREATE TABLE IF NOT EXISTS measurement_fields (
  id             CHAR(36)    NOT NULL PRIMARY KEY DEFAULT (UUID()),
  measurement_id CHAR(36)    NOT NULL,
  field_name     VARCHAR(255) NOT NULL,
  data_type      VARCHAR(64),
  unit           VARCHAR(64),
  created_at     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_meas_field (measurement_id, field_name),
  CONSTRAINT fk_meas_fields_meas FOREIGN KEY (measurement_id) REFERENCES org_measurements(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Tag keys (per measurement) ----------
CREATE TABLE IF NOT EXISTS measurement_tag_keys (
  id             CHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  measurement_id CHAR(36)   NOT NULL,
  tag_key        VARCHAR(255) NOT NULL,
  created_at     DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_meas_tagkey (measurement_id, tag_key),
  CONSTRAINT fk_meas_tagkeys_meas FOREIGN KEY (measurement_id) REFERENCES org_measurements(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Per-user aliases ----------
CREATE TABLE IF NOT EXISTS organization_aliases (
  id               CHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  organization_id  CHAR(36)   NOT NULL,
  user_id          CHAR(36)   NOT NULL,
  alias            VARCHAR(255) NOT NULL,
  is_primary       BOOLEAN    NOT NULL DEFAULT TRUE,
  created_at       DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_org_alias (organization_id, user_id, alias),
  CONSTRAINT fk_org_alias_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_org_alias_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS measurement_aliases (
  id             CHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  measurement_id CHAR(36)   NOT NULL,
  user_id        CHAR(36)   NOT NULL,
  alias          VARCHAR(255) NOT NULL,
  is_primary     BOOLEAN    NOT NULL DEFAULT TRUE,
  created_at     DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_measurement_alias (measurement_id, user_id, alias),
  CONSTRAINT fk_meas_alias_meas FOREIGN KEY (measurement_id) REFERENCES org_measurements(id),
  CONSTRAINT fk_meas_alias_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS field_aliases (
  id         CHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  field_id   CHAR(36)   NOT NULL,
  user_id    CHAR(36)   NOT NULL,
  alias      VARCHAR(255) NOT NULL,
  is_primary BOOLEAN    NOT NULL DEFAULT TRUE,
  language   VARCHAR(32),
  created_at DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_field_alias (field_id, user_id, alias),
  CONSTRAINT fk_field_alias_field FOREIGN KEY (field_id) REFERENCES measurement_fields(id),
  CONSTRAINT fk_field_alias_user  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tag_key_aliases (
  id         CHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  tag_key_id CHAR(36)   NOT NULL,
  user_id    CHAR(36)   NOT NULL,
  alias      VARCHAR(255) NOT NULL,
  is_primary BOOLEAN    NOT NULL DEFAULT TRUE,
  language   VARCHAR(32),
  created_at DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tagkey_alias (tag_key_id, user_id, alias),
  CONSTRAINT fk_tagkey_alias_tag FOREIGN KEY (tag_key_id) REFERENCES measurement_tag_keys(id),
  CONSTRAINT fk_tagkey_alias_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Data groups ----------
CREATE TABLE IF NOT EXISTS data_groups (
  id               CHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  organization_id  CHAR(36)   NOT NULL,
  owner_user_id    CHAR(36)   NOT NULL,
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  is_private       BOOLEAN    NOT NULL DEFAULT TRUE,
  created_at       DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_group_name_owner (organization_id, owner_user_id, name),
  CONSTRAINT fk_groups_org  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_groups_owner FOREIGN KEY (owner_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS group_fields (
  group_id CHAR(36) NOT NULL,
  field_id CHAR(36) NOT NULL,
  position INT      NULL,
  PRIMARY KEY (group_id, field_id),
  CONSTRAINT fk_group_fields_group FOREIGN KEY (group_id) REFERENCES data_groups(id),
  CONSTRAINT fk_group_fields_field FOREIGN KEY (field_id) REFERENCES measurement_fields(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS group_tag_keys (
  group_id  CHAR(36) NOT NULL,
  tag_key_id CHAR(36) NOT NULL,
  position  INT NULL,
  PRIMARY KEY (group_id, tag_key_id),
  CONSTRAINT fk_group_tags_group FOREIGN KEY (group_id) REFERENCES data_groups(id),
  CONSTRAINT fk_group_tags_tag   FOREIGN KEY (tag_key_id) REFERENCES measurement_tag_keys(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- App roles ----------
CREATE TABLE IF NOT EXISTS app_roles (
  id          CHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  role_key    VARCHAR(64) NOT NULL UNIQUE,   -- <— renamed
  name        VARCHAR(128) NOT NULL,
  description TEXT,
  level       INT,
  created_at  DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_app_roles (
  id          CHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  user_id     CHAR(36)   NOT NULL,
  role_id     CHAR(36)   NOT NULL,
  assigned_at DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_role (user_id, role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES app_roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- User suspensions (audit) ----------
CREATE TABLE IF NOT EXISTS user_suspensions (
  id          CHAR(36)  NOT NULL PRIMARY KEY DEFAULT (UUID()),
  user_id     CHAR(36)  NOT NULL,
  by_user_id  CHAR(36)  NULL,
  start_time  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_time    DATETIME  NULL, -- null = indefinite until lifted
  reason      TEXT,
  created_at  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_susp_user_start (user_id, start_time),
  CONSTRAINT fk_susp_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_susp_by    FOREIGN KEY (by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- API tokens & requests ----------
CREATE TABLE IF NOT EXISTS api_tokens (
  id          CHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  user_id     CHAR(36)   NOT NULL,
  name        VARCHAR(128),
  token_hash  CHAR(64)   NOT NULL UNIQUE, -- SHA256 hex
  scopes      JSON       NULL,
  expires_at  DATETIME   NULL,
  revoked_at  DATETIME   NULL,
  created_at  DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at DATETIME  NULL,
  INDEX idx_api_tokens_user (user_id),
  CONSTRAINT fk_api_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS api_requests (
  id           BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  token_id     CHAR(36)   NULL,
  user_id      CHAR(36)   NULL,
  method       VARCHAR(16),
  path         TEXT,
  status_code  INT,
  latency_ms   INT,
  ip           VARCHAR(45),
  created_at   DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_api_req_token_created (token_id, created_at),
  INDEX idx_api_req_user_created  (user_id, created_at),
  CONSTRAINT fk_api_req_token FOREIGN KEY (token_id) REFERENCES api_tokens(id),
  CONSTRAINT fk_api_req_user  FOREIGN KEY (user_id)  REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Grafana panels, versions, dashboards ----------
CREATE TABLE IF NOT EXISTS grafana_panels (
  id               CHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  user_id          CHAR(36)   NOT NULL,
  name             VARCHAR(255) NOT NULL,
  grafana_view_type VARCHAR(64),
  flux_snippet     MEDIUMTEXT,
  panel_json       JSON,
  current_version  INT        NOT NULL DEFAULT 1,
  created_at       DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_panels_user_name (user_id, name),
  CONSTRAINT fk_panels_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS panel_tags (
  id               CHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  user_id          CHAR(36)   NOT NULL,
  organization_id  CHAR(36)   NULL,
  name             VARCHAR(64) NOT NULL,
  color            VARCHAR(16),
  created_at       DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_panel_tag (user_id, name),
  CONSTRAINT fk_panel_tags_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_panel_tags_org  FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS panel_tag_assignments (
  panel_id   CHAR(36) NOT NULL,
  tag_id     CHAR(36) NOT NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (panel_id, tag_id),
  CONSTRAINT fk_panel_tag_assign_panel FOREIGN KEY (panel_id) REFERENCES grafana_panels(id),
  CONSTRAINT fk_panel_tag_assign_tag   FOREIGN KEY (tag_id)   REFERENCES panel_tags(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS grafana_panel_versions (
  id               CHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  panel_id         CHAR(36)   NOT NULL,
  version          INT        NOT NULL,
  edited_by        CHAR(36)   NOT NULL,
  change_note      TEXT,
  grafana_view_type VARCHAR(64),
  flux_snippet     MEDIUMTEXT,
  panel_json       JSON,
  created_at       DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_panel_version (panel_id, version),
  INDEX idx_panel_versions_created (panel_id, created_at),
  CONSTRAINT fk_panel_versions_panel FOREIGN KEY (panel_id) REFERENCES grafana_panels(id),
  CONSTRAINT fk_panel_versions_editor FOREIGN KEY (edited_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS grafana_panel_restores (
  id            CHAR(36)  NOT NULL PRIMARY KEY DEFAULT (UUID()),
  panel_id      CHAR(36)  NOT NULL,
  from_version  INT       NOT NULL,
  to_version    INT       NOT NULL,
  restored_by   CHAR(36)  NOT NULL,
  reason        TEXT,
  created_at    DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_panel_restores_panel FOREIGN KEY (panel_id) REFERENCES grafana_panels(id),
  CONSTRAINT fk_panel_restores_user  FOREIGN KEY (restored_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS grafana_dashboards (
  id          CHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  user_id     CHAR(36)   NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  created_at  DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_dashboard_user_name (user_id, name),
  CONSTRAINT fk_dashboards_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS layout_panels (
  id            CHAR(36)  NOT NULL PRIMARY KEY DEFAULT (UUID()),
  dashboard_id  CHAR(36)  NOT NULL,
  panel_id      CHAR(36)  NOT NULL,
  order_index   INT       NOT NULL,
  UNIQUE KEY uk_dashboard_panel (dashboard_id, panel_id),
  INDEX idx_dashboard_order (dashboard_id, order_index),
  CONSTRAINT fk_layout_dash FOREIGN KEY (dashboard_id) REFERENCES grafana_dashboards(id),
  CONSTRAINT fk_layout_panel FOREIGN KEY (panel_id)     REFERENCES grafana_panels(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Notifications ----------
CREATE TABLE IF NOT EXISTS notifications (
  id               CHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
  user_id          CHAR(36)   NOT NULL, -- recipient
  organization_id  CHAR(36)   NULL,     -- optional scope
  actor_user_id    CHAR(36)   NULL,     -- who triggered (nullable)

  -- Classification
  type             VARCHAR(64)  NOT NULL,             -- system | alert | panel | mfa | api
  severity         VARCHAR(16)  NOT NULL DEFAULT 'info', -- info | warning | critical
  channel          VARCHAR(16)  NOT NULL DEFAULT 'web',  -- web | email | webhook

  -- Content
  title            VARCHAR(255) NOT NULL,
  body             TEXT,
  link_url         TEXT,
  metadata         JSON,

  -- Delivery & state
  status           VARCHAR(16)  NOT NULL DEFAULT 'queued', -- queued | sent | failed
  error            TEXT,
  seen_at          DATETIME     NULL,
  read_at          DATETIME     NULL,
  sent_at          DATETIME     NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_notif_user_status_created (user_id, status, created_at),
  INDEX idx_notif_user_read (user_id, read_at),
  INDEX idx_notif_org_created (organization_id, created_at),

  CONSTRAINT fk_notif_user  FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_notif_org   FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_notif_actor FOREIGN KEY (actor_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;