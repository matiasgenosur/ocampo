#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Crea campaña completa de Google Ads para Ocampo Demoliciones.
Campaña: Retiro Asbesto | Búsqueda | Conversiones

Uso: python crear_campana_asbesto.py
"""

import sys
import subprocess
from pathlib import Path

# ─── Auto-install ─────────────────────────────────────────────────────────────
def _install(pkg: str):
    print(f"Instalando {pkg}...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", pkg],
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"✓ {pkg} instalado")

try:
    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException
except ImportError:
    _install("google-ads")
    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException

try:
    import yaml
except ImportError:
    _install("pyyaml")
    import yaml

# ─── Configuración ────────────────────────────────────────────────────────────
CREDENTIALS_PATH  = str(Path(__file__).parent / "google-ads.yaml")
CLIENT_CUSTOMER_ID = "9745270233"           # Ocampo Demoliciones (cuenta cliente)
CAMPAIGN_NAME     = "Retiro Asbesto | Búsqueda | Conversiones"
BUDGET_MICROS     = 10_000_000_000          # 10.000 CLP × 1.000.000
BASE_URL          = "https://www.ocampo.cl/servicios/retiro-asbesto.html"
TRACKING_TEMPLATE = "{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign=asbesto&utm_term={keyword}"
LOCATION_RM       = 20160                   # Región Metropolitana de Santiago, Chile
LANGUAGE_ES       = 1003                    # Español
ERRORS: list = []

# ─── Utilidades ───────────────────────────────────────────────────────────────
def log_error(label: str, exc: Exception):
    if isinstance(exc, GoogleAdsException):
        for e in exc.failure.errors:
            msg = f"{label} → {e.message} | location: {e.location} | trigger: {e.trigger}"
            print(f"  ✗ {msg}")
            ERRORS.append(msg)
    else:
        msg = f"{label} → {exc}"
        print(f"  ✗ {msg}")
        ERRORS.append(msg)

def get_customer_id(client: GoogleAdsClient) -> str:
    """Retorna el customer_id de la cuenta cliente (Ocampo Demoliciones)."""
    return CLIENT_CUSTOMER_ID


# ─── 1. CONVERSIÓN ────────────────────────────────────────────────────────────
def create_conversion_action(client: GoogleAdsClient, cid: str):
    print("\n[1] Creando acción de conversión...")
    svc = client.get_service("ConversionActionService")
    op  = client.get_type("ConversionActionOperation")
    ca  = op.create

    ca.name          = "Formulario Cotización Asbesto"
    ca.category      = client.enums.ConversionActionCategoryEnum.SUBMIT_LEAD_FORM
    ca.type_         = client.enums.ConversionActionTypeEnum.WEBPAGE
    ca.status        = client.enums.ConversionActionStatusEnum.ENABLED
    ca.counting_type = client.enums.ConversionActionCountingTypeEnum.ONE_PER_CLICK
    ca.click_through_lookback_window_days = 30
    ca.view_through_lookback_window_days  = 1
    ca.attribution_model_settings.attribution_model = (
        client.enums.AttributionModelEnum.GOOGLE_ADS_LAST_CLICK
    )

    try:
        resp  = svc.mutate_conversion_actions(customer_id=cid, operations=[op])
        rn    = resp.results[0].resource_name
        ca_id = rn.split("/")[-1]
        print(f"  ✓ Conversión creada → ID: {ca_id}  |  {rn}")
        return rn, ca_id
    except GoogleAdsException as ex:
        # Si ya existe, recuperarla
        for e in ex.failure.errors:
            if "already exists" in e.message.lower():
                print("  ℹ Conversión ya existe, recuperando...")
                return fetch_existing_conversion(client, cid)
        log_error("Conversión", ex)
        return None, None


def fetch_existing_conversion(client: GoogleAdsClient, cid: str):
    """Recupera la conversión existente por nombre."""
    svc   = client.get_service("GoogleAdsService")
    query = """
        SELECT conversion_action.id, conversion_action.resource_name
        FROM   conversion_action
        WHERE  conversion_action.name = 'Formulario Cotización Asbesto'
    """
    try:
        rows = list(svc.search(customer_id=cid, query=query))
        if rows:
            ca = rows[0].conversion_action
            print(f"  ✓ Conversión recuperada → ID: {ca.id}  |  {ca.resource_name}")
            return ca.resource_name, str(ca.id)
    except Exception as ex:
        log_error("Recuperar conversión", ex)
    return None, None


def fetch_conversion_snippet(client: GoogleAdsClient, cid: str, ca_rn: str):
    """Obtiene el snippet de seguimiento desde la API."""
    svc   = client.get_service("GoogleAdsService")
    query = f"""
        SELECT conversion_action.id,
               conversion_action.tag_snippets
        FROM   conversion_action
        WHERE  conversion_action.resource_name = '{ca_rn}'
    """
    try:
        rows = list(svc.search(customer_id=cid, query=query))
        if not rows:
            return None, None, None
        ca = rows[0].conversion_action
        for snippet in ca.tag_snippets:
            if snippet.type_ == client.enums.TagSnippetTypeEnum.WEBPAGE:
                return ca.id, snippet.global_site_tag, snippet.event_snippet
        # Fallback: primer snippet disponible
        if ca.tag_snippets:
            s = ca.tag_snippets[0]
            return ca.id, s.global_site_tag, s.event_snippet
        return ca.id, None, None
    except Exception as ex:
        log_error("Fetch snippet", ex)
        return None, None, None


# ─── 2. PRESUPUESTO ───────────────────────────────────────────────────────────
def create_budget(client: GoogleAdsClient, cid: str) -> str:
    print("\n[2] Creando presupuesto diario (10.000 CLP)...")
    svc = client.get_service("CampaignBudgetService")
    op  = client.get_type("CampaignBudgetOperation")
    b   = op.create

    b.name              = "Presupuesto Retiro Asbesto"
    b.amount_micros     = BUDGET_MICROS
    b.delivery_method   = client.enums.BudgetDeliveryMethodEnum.STANDARD
    b.explicitly_shared = False

    try:
        resp   = svc.mutate_campaign_budgets(customer_id=cid, operations=[op])
        rn     = resp.results[0].resource_name
        bud_id = rn.split("/")[-1]
        print(f"  ✓ Presupuesto creado → ID: {bud_id}  |  {rn}")
        return rn
    except GoogleAdsException as ex:
        log_error("Presupuesto", ex)
        return None


# ─── 3. CAMPAÑA ───────────────────────────────────────────────────────────────
def create_campaign(client: GoogleAdsClient, cid: str,
                    budget_rn: str, ca_rn: str):
    print("\n[3] Creando campaña...")
    svc = client.get_service("CampaignService")
    op  = client.get_type("CampaignOperation")
    c   = op.create

    c.name   = CAMPAIGN_NAME
    c.status = client.enums.CampaignStatusEnum.PAUSED   # activar manualmente
    c.advertising_channel_type = client.enums.AdvertisingChannelTypeEnum.SEARCH
    c.campaign_budget          = budget_rn
    c.tracking_url_template    = TRACKING_TEMPLATE

    # Red de Búsqueda únicamente (sin partners ni display)
    c.network_settings.target_google_search        = True
    c.network_settings.target_search_network       = False
    c.network_settings.target_content_network      = False
    c.network_settings.target_partner_search_network = False

    # Requerido en API v23 (enum EuPoliticalAdvertisingStatus)
    c._pb.contains_eu_political_advertising = 3  # DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING

    # Estrategia: Maximizar conversiones
    # Usar SetInParent() para activar el campo oneof en protobuf
    c._pb.maximize_conversions.SetInParent()

    try:
        resp       = svc.mutate_campaigns(customer_id=cid, operations=[op])
        rn         = resp.results[0].resource_name
        c_id       = rn.split("/")[-1]
        print(f"  ✓ Campaña creada → ID: {c_id}  |  {rn}")
        return rn, c_id
    except GoogleAdsException as ex:
        log_error("Campaña", ex)
        return None, None


# ─── 4. TARGETING: UBICACIÓN, IDIOMA Y HORARIOS ───────────────────────────────
def add_campaign_criteria(client: GoogleAdsClient, cid: str, campaign_rn: str):
    print("\n[4] Configurando targeting (ubicación, idioma, horarios)...")
    svc = client.get_service("CampaignCriterionService")
    ops = []

    # Ubicación: incluir Región Metropolitana (20121)
    op_loc = client.get_type("CampaignCriterionOperation")
    loc    = op_loc.create
    loc.campaign = campaign_rn
    loc.negative = False
    loc.location.geo_target_constant = f"geoTargetConstants/{LOCATION_RM}"
    ops.append(op_loc)

    # Idioma: Español (1003)
    op_lang = client.get_type("CampaignCriterionOperation")
    lang    = op_lang.create
    lang.campaign = campaign_rn
    lang.language.language_constant = f"languageConstants/{LANGUAGE_ES}"
    ops.append(op_lang)

    # Horario: Lunes a Viernes 7:00–20:00
    for day in [
        client.enums.DayOfWeekEnum.MONDAY,
        client.enums.DayOfWeekEnum.TUESDAY,
        client.enums.DayOfWeekEnum.WEDNESDAY,
        client.enums.DayOfWeekEnum.THURSDAY,
        client.enums.DayOfWeekEnum.FRIDAY,
    ]:
        op_sch = client.get_type("CampaignCriterionOperation")
        sch    = op_sch.create
        sch.campaign                 = campaign_rn
        sch.ad_schedule.day_of_week  = day
        sch.ad_schedule.start_hour   = 7
        sch.ad_schedule.start_minute = client.enums.MinuteOfHourEnum.ZERO
        sch.ad_schedule.end_hour     = 20
        sch.ad_schedule.end_minute   = client.enums.MinuteOfHourEnum.ZERO
        ops.append(op_sch)

    # Horario: Sábado 8:00–14:00
    op_sat = client.get_type("CampaignCriterionOperation")
    sat    = op_sat.create
    sat.campaign                 = campaign_rn
    sat.ad_schedule.day_of_week  = client.enums.DayOfWeekEnum.SATURDAY
    sat.ad_schedule.start_hour   = 8
    sat.ad_schedule.start_minute = client.enums.MinuteOfHourEnum.ZERO
    sat.ad_schedule.end_hour     = 14
    sat.ad_schedule.end_minute   = client.enums.MinuteOfHourEnum.ZERO
    ops.append(op_sat)

    try:
        resp = svc.mutate_campaign_criteria(customer_id=cid, operations=ops)
        print(f"  ✓ {len(resp.results)} criterios de targeting creados")
    except GoogleAdsException as ex:
        log_error("Targeting", ex)


# ─── 5. PALABRAS CLAVE NEGATIVAS ──────────────────────────────────────────────
def add_negative_keywords(client: GoogleAdsClient, cid: str, campaign_rn: str):
    print("\n[5] Agregando palabras clave negativas...")
    negatives = [
        "gratis", "bricolaje", "cómo hacer", "DIY", "yo mismo", "wikipedia",
        "síntomas", "enfermedades", "mesotelioma", "asbestosis", "definición",
        "imágenes", "trabajo", "empleos", "curriculum", "postular", "curso",
        "capacitación", "certificación personal", "comprar asbesto",
        "venta asbesto", "fibrocemento precio", "abogado asbesto",
        "demanda asbesto", "indemnización",
    ]
    svc = client.get_service("CampaignCriterionService")
    ops = []
    for kw in negatives:
        op = client.get_type("CampaignCriterionOperation")
        c  = op.create
        c.campaign           = campaign_rn
        c.negative           = True
        c.keyword.text       = kw
        c.keyword.match_type = client.enums.KeywordMatchTypeEnum.BROAD
        ops.append(op)

    try:
        resp = svc.mutate_campaign_criteria(customer_id=cid, operations=ops)
        print(f"  ✓ {len(resp.results)} negativas agregadas")
    except GoogleAdsException as ex:
        log_error("Negativas", ex)


# ─── 6. GRUPOS + KEYWORDS + RSAs ──────────────────────────────────────────────
def create_ad_group(client: GoogleAdsClient, cid: str,
                    campaign_rn: str, name: str) -> str:
    svc = client.get_service("AdGroupService")
    op  = client.get_type("AdGroupOperation")
    ag  = op.create

    ag.name     = name
    ag.campaign = campaign_rn
    ag.status   = client.enums.AdGroupStatusEnum.ENABLED
    ag.type_    = client.enums.AdGroupTypeEnum.SEARCH_STANDARD

    try:
        resp  = svc.mutate_ad_groups(customer_id=cid, operations=[op])
        rn    = resp.results[0].resource_name
        ag_id = rn.split("/")[-1]
        print(f"\n  ● Grupo '{name}'  →  ID: {ag_id}")
        return rn
    except GoogleAdsException as ex:
        log_error(f"Grupo {name}", ex)
        return None


def add_keywords(client: GoogleAdsClient, cid: str,
                 ag_rn: str, keywords_by_type: dict):
    svc      = client.get_service("AdGroupCriterionService")
    mt_enum  = client.enums.KeywordMatchTypeEnum
    ops      = []

    for match_type, kws in keywords_by_type.items():
        mt = getattr(mt_enum, match_type)
        for kw in kws:
            op = client.get_type("AdGroupCriterionOperation")
            c  = op.create
            c.ad_group           = ag_rn
            c.status             = client.enums.AdGroupCriterionStatusEnum.ENABLED
            c.keyword.text       = kw
            c.keyword.match_type = mt
            ops.append(op)

    if not ops:
        return
    try:
        resp = svc.mutate_ad_group_criteria(customer_id=cid, operations=ops)
        print(f"    → {len(resp.results)} keywords creadas")
    except GoogleAdsException as ex:
        log_error(f"Keywords {ag_rn}", ex)


def add_rsa(client: GoogleAdsClient, cid: str,
            ag_rn: str, headlines: list, descriptions: list):
    svc = client.get_service("AdGroupAdService")
    op  = client.get_type("AdGroupAdOperation")
    aga = op.create

    aga.ad_group = ag_rn
    aga.status   = client.enums.AdGroupAdStatusEnum.ENABLED

    rsa       = aga.ad.responsive_search_ad
    rsa.path1 = "asbesto"
    rsa.path2 = "cotizar"

    for h in headlines:
        asset      = client.get_type("AdTextAsset")
        asset.text = h[:30]   # máx 30 caracteres
        rsa.headlines.append(asset)

    for d in descriptions:
        asset      = client.get_type("AdTextAsset")
        asset.text = d[:90]   # máx 90 caracteres
        rsa.descriptions.append(asset)

    aga.ad.final_urls.append(BASE_URL)

    try:
        resp = svc.mutate_ad_group_ads(customer_id=cid, operations=[op])
        rn   = resp.results[0].resource_name
        print(f"    → RSA creado: {rn.split('/')[-1]}")
    except GoogleAdsException as ex:
        log_error(f"RSA {ag_rn}", ex)


# ─── 7. EXTENSIONES ───────────────────────────────────────────────────────────
def create_extensions(client: GoogleAdsClient, cid: str, campaign_rn: str):
    print("\n[8] Creando extensiones y vinculando a la campaña...")
    asset_svc      = client.get_service("AssetService")
    camp_asset_svc = client.get_service("CampaignAssetService")
    field_enum     = client.enums.AssetFieldTypeEnum

    asset_links = []   # [(resource_name, field_type)]

    # ── Sitelinks ──
    sitelinks = [
        ("Cotizar Ahora",    "https://www.ocampo.cl/servicios/retiro-asbesto.html#contacto"),
        ("Nuestro Proceso",  "https://www.ocampo.cl/servicios/retiro-asbesto.html"),
        ("Ver Proyectos",    "https://www.ocampo.cl/#proyectos"),
        ("WhatsApp Directo", "https://wa.me/56928553089"),
    ]
    for text, url in sitelinks:
        op = client.get_type("AssetOperation")
        a  = op.create
        a.sitelink_asset.link_text = text
        a.final_urls.append(url)   # URL va en Asset, no en SitelinkAsset
        try:
            resp = asset_svc.mutate_assets(customer_id=cid, operations=[op])
            asset_links.append((resp.results[0].resource_name, field_enum.SITELINK))
            print(f"  ✓ Sitelink '{text}'")
        except GoogleAdsException as ex:
            log_error(f"Sitelink {text}", ex)

    # ── Callouts ──
    callouts = [
        "Certificado DS 594",
        "Personal Capacitado ISP",
        "Cert. Disposición Final",
        "+10 Años Experiencia",
        "Cero Accidentes Laborales",
    ]
    for text in callouts:
        op = client.get_type("AssetOperation")
        a  = op.create
        a.callout_asset.callout_text = text
        try:
            resp = asset_svc.mutate_assets(customer_id=cid, operations=[op])
            asset_links.append((resp.results[0].resource_name, field_enum.CALLOUT))
            print(f"  ✓ Callout '{text}'")
        except GoogleAdsException as ex:
            log_error(f"Callout {text}", ex)

    # ── Fragmento estructurado ──
    op = client.get_type("AssetOperation")
    a  = op.create
    ss = a.structured_snippet_asset
    ss.header = "Servicios"
    for val in ["Inspección técnica", "Plan de trabajo SEREMI",
                "Retiro controlado", "Embalaje normativo", "Certificado final"]:
        ss.values.append(val)
    try:
        resp = asset_svc.mutate_assets(customer_id=cid, operations=[op])
        asset_links.append((resp.results[0].resource_name, field_enum.STRUCTURED_SNIPPET))
        print("  ✓ Fragmento estructurado 'Servicios incluidos'")
    except GoogleAdsException as ex:
        log_error("Fragmento estructurado", ex)

    # ── Vincular todos los assets a la campaña ──
    link_ops = []
    for rn, ft in asset_links:
        op = client.get_type("CampaignAssetOperation")
        ca = op.create
        ca.campaign   = campaign_rn
        ca.asset      = rn
        ca.field_type = ft
        link_ops.append(op)

    if link_ops:
        try:
            resp = camp_asset_svc.mutate_campaign_assets(
                customer_id=cid, operations=link_ops)
            print(f"  ✓ {len(resp.results)} extensiones vinculadas a la campaña")
        except GoogleAdsException as ex:
            log_error("Vincular extensiones", ex)


# ─── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    sep = "=" * 65
    print(sep)
    print("  Ocampo Demoliciones — Crear Campaña Google Ads")
    print(sep)

    # Carga credenciales, normaliza IDs y añade use_proto_plus si falta
    with open(CREDENTIALS_PATH) as f:
        cfg = yaml.safe_load(f)
    cfg.setdefault("use_proto_plus", True)
    # Normalizar login_customer_id: quitar guiones y espacios
    for key in ("login_customer_id", "customer_id"):
        if key in cfg and cfg[key]:
            cfg[key] = str(cfg[key]).replace("-", "").replace(" ", "").strip()
    client = GoogleAdsClient.load_from_dict(cfg)
    cid    = get_customer_id(client)
    print(f"  Customer ID: {cid}")

    # Modo reanudación: si ya existe campaña, solo crear RSAs y extensiones
    EXISTING_CAMPAIGN_ID = "23723721016"   # campaña ya creada en corrida anterior
    EXISTING_CA_ID       = "7559602721"    # conversión ya creada

    if EXISTING_CAMPAIGN_ID:
        print(f"\n  ℹ Reanudando desde campaña existente ID: {EXISTING_CAMPAIGN_ID}")
        campaign_rn = f"customers/{cid}/campaigns/{EXISTING_CAMPAIGN_ID}"
        campaign_id = EXISTING_CAMPAIGN_ID
        ca_rn       = f"customers/{cid}/conversionActions/{EXISTING_CA_ID}"
        ca_id       = EXISTING_CA_ID
    else:
        # ── 1. Conversión ──
        ca_rn, ca_id = create_conversion_action(client, cid)

        # ── 2. Presupuesto ──
        budget_rn = create_budget(client, cid)
        if not budget_rn:
            print("\n✗ No se pudo crear el presupuesto. Abortando.")
            return

        # ── 3. Campaña ──
        campaign_rn, campaign_id = create_campaign(client, cid, budget_rn, ca_rn)
        if not campaign_rn:
            print("\n✗ No se pudo crear la campaña. Abortando.")
            return

        # ── 4. Targeting ──
        add_campaign_criteria(client, cid, campaign_rn)

        # ── 5. Negativas ──
        add_negative_keywords(client, cid, campaign_rn)

    # ── 6. Grupos + Keywords + RSAs ──
    print("\n[6] Creando grupos de anuncios, keywords y anuncios RSA...")

    GRUPOS = [
        {
            "name": "Retiro Asbesto General",
            "keywords": {
                "EXACT":  ["retiro de asbesto", "empresa retiro asbesto", "retiro amianto"],
                "PHRASE": ["retiro de asbesto santiago", "empresa retiro de amianto",
                           "retiro asbesto chile"],
                "BROAD":  ["retiro asbesto profesional"],
            },
            "headlines": [
                "Retiro de Asbesto Certificado",
                "Empresa Autorizada DS 594",
                "Cotización Sin Costo",
                "+10 Años de Experiencia",
                "Retiro Seguro y Profesional",
                "Solicita Cotización Ahora",
                "Empresa Certificada Chile",
                "Protege la Salud de tu Equipo",
            ],
            "descriptions": [
                "Evita multas de hasta 1.000 UTM ($60MM+). Empresa certificada con +10 años. "
                "Retiro, transporte y disposición final con certificado oficial.",
                "Gestionamos permisos SEREMI, retiro controlado y disposición final autorizada. "
                "Cotización gratuita en 24 horas. Llámanos hoy.",
            ],
        },
        {
            "name": "Retiro Asbesto Certificado",
            "keywords": {
                "EXACT":  ["retiro asbesto certificado", "empresa certificada retiro asbesto"],
                "PHRASE": ["retiro asbesto normativa", "retiro asbesto ds 594",
                           "empresa autorizada retiro asbesto"],
                "BROAD":  ["retiro asbesto autorizado SEREMI",
                           "empresa asbesto certificada chile"],
            },
            "headlines": [
                "Certificado de Disposición Final",
                "Cumplimos Normativa SEREMI",
                "Empresa Autorizada DS 594",
                "Gestión Completa de Asbesto",
                "Retiro Amianto Santiago",
                "Personal Capacitado ISP",
                "Cotización Gratis en 24 Hrs",
                "Disposición Residuos Peligrosos",
            ],
            "descriptions": [
                "Cumplimos estrictamente el DS 594 MINSAL. Personal certificado ante ISP y SEREMI. "
                "Entregamos informe técnico, registro fotográfico y certificado de eliminación.",
                "Empresa autorizada para retiro y disposición final de asbesto en Chile. "
                "Gestionamos todos los permisos con la autoridad sanitaria. Solicita tu cotización.",
            ],
        },
        {
            "name": "Disposición y Gestión Residuos",
            "keywords": {
                "EXACT":  ["disposición asbesto chile", "gestión residuos asbesto"],
                "PHRASE": ["eliminación asbesto", "disposición final asbesto",
                           "gestión asbesto industrial"],
                "BROAD":  ["transporte residuos asbesto", "disposición amianto autorizado"],
            },
            "headlines": [
                "Disposición Final de Asbesto",
                "Transporte Autorizado Asbesto",
                "Gestión Residuos Peligrosos",
                "Certificado de Eliminación",
                "Sitios Autorizados de Disposición",
                "Empresa Certificada Chile",
                "Todo Incluido: Retiro y Disposición",
                "Cumplimiento Normativo Total",
            ],
            "descriptions": [
                "Gestionamos todo el ciclo: retiro, embalaje en doble bolsa polietileno, "
                "transporte autorizado y disposición final certificada. Entregamos documentación completa.",
                "No te arriesgues con empresas no autorizadas. Somos especialistas en gestión "
                "de residuos peligrosos con asbesto. Cotización personalizada sin costo.",
            ],
        },
        {
            "name": "Urgencia - Multas DS 594",
            "keywords": {
                "EXACT":  ["multa retiro asbesto", "normativa asbesto chile"],
                "PHRASE": ["DS 594 asbesto", "ley asbesto chile", "multa asbesto SEREMI"],
                "BROAD":  ["ilegal retirar asbesto solo", "sanción asbesto trabajo"],
            },
            "headlines": [
                "Evita Multas de Hasta $60MM",
                "Retiro Asbesto Legal en Chile",
                "DS 594: Cumplimiento Total",
                "Multas de Hasta 1.000 UTM",
                "Empresa Autorizada SEREMI",
                "No Arriesgues tu Empresa",
                "Visita Técnica Gratuita",
                "Gestión Legal y Certificada",
            ],
            "descriptions": [
                "El retiro sin empresa certificada es ilegal y arriesga multas sobre 1.000 UTM. "
                "Nosotros gestionamos permisos SEREMI, retiro controlado y disposición final. "
                "Todo incluido.",
                "Protege a tu equipo y evita sanciones. Somos la empresa certificada que gestiona "
                "todo el proceso según DS 594 MINSAL. Solicita cotización hoy, sin compromiso.",
            ],
        },
        {
            "name": "Tipo de Propiedad",
            "keywords": {
                "EXACT":  [],
                "PHRASE": [
                    "retiro asbesto galpón",
                    "retiro asbesto bodega industrial",
                    "retiro asbesto edificio",
                    "retiro asbesto planta",
                    "retiro asbesto colegio",
                ],
                "BROAD":  ["asbesto techo industrial santiago",
                           "retiro fibrocemento asbesto"],
            },
            "headlines": [
                "Retiro Asbesto en Galpones",
                "Especialistas en Industrial",
                "Retiro Asbesto en Edificios",
                "Bodegas y Plantas Industriales",
                "Permisos SEREMI Incluidos",
                "Cotización Personalizada",
                "Respuesta en 24 Horas",
                "+500 Proyectos Realizados",
            ],
            "descriptions": [
                "Especialistas en retiro de asbesto en instalaciones industriales, bodegas, "
                "galpones y edificios. Gestionamos permisos SEREMI y entregamos certificado "
                "de eliminación.",
                "Hemos trabajado con constructoras, inmobiliarias, entidades públicas y empresas "
                "mineras. Cotización personalizada según el tipo y tamaño de tu instalación.",
            ],
        },
    ]

    # IDs de grupos ya creados (de corrida anterior)
    EXISTING_GROUPS = {
        "Retiro Asbesto General":        "195927742478",
        "Retiro Asbesto Certificado":    "194353661025",
        "Disposición y Gestión Residuos":"198114554554",
        "Urgencia - Multas DS 594":      "197903170951",
        "Tipo de Propiedad":             "198857026470",
    }

    print("\n[6] Creando anuncios RSA en grupos existentes...")
    for g in GRUPOS:
        ag_id = EXISTING_GROUPS.get(g["name"])
        if ag_id:
            ag_rn = f"customers/{cid}/adGroups/{ag_id}"
            print(f"\n  ● Grupo '{g['name']}'  (existente ID: {ag_id})")
            add_rsa(client, cid, ag_rn, g["headlines"], g["descriptions"])
        else:
            ag_rn = create_ad_group(client, cid, campaign_rn, g["name"])
            if ag_rn:
                add_keywords(client, cid, ag_rn, g["keywords"])
                add_rsa(client, cid, ag_rn, g["headlines"], g["descriptions"])

    # ── 7. Extensiones ──
    create_extensions(client, cid, campaign_rn)

    # ── 8. Snippet de conversión ──
    print("\n[9] Obteniendo snippet de seguimiento para /gracias.html...")
    conv_id = ca_id
    global_tag, event_snippet = None, None
    if ca_rn:
        conv_id_api, global_tag, event_snippet = fetch_conversion_snippet(
            client, cid, ca_rn)
        if conv_id_api:
            conv_id = conv_id_api

    # ─── RESUMEN ────────────────────────────────────────────────────────
    print(f"\n{sep}")
    print("  RESUMEN DE ELEMENTOS CREADOS")
    print(sep)
    print(f"  Campaña ID    : {campaign_id}")
    print(f"  Conversión ID : {ca_id}")
    print(f"  Grupos        : {len(GRUPOS)}")
    print(f"  Estado        : PAUSADA  ← actívala manualmente cuando estés listo")
    print(f"  Presupuesto   : 10.000 CLP/día")
    print(f"  Targeting     : Región Metropolitana de Santiago (ID {LOCATION_RM})")
    print(f"  Horario       : Lun–Vie 07:00–20:00 / Sáb 08:00–14:00")

    # ─── SNIPPET DE SEGUIMIENTO ─────────────────────────────────────────
    print(f"\n{sep}")
    print("  SNIPPET DE SEGUIMIENTO")
    print("  Pegar en https://www.ocampo.cl/gracias.html (antes de </body>)")
    print(sep)

    if global_tag and event_snippet:
        print(global_tag)
        print()
        print(event_snippet)
    else:
        # Snippet construido con el ID disponible
        aw = f"AW-{conv_id}" if conv_id else "AW-XXXXXXXXXX"
        print(f"""<!-- Google tag (gtag.js) — Google Ads Conversions -->
<script async src="https://www.googletagmanager.com/gtag/js?id={aw}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
  gtag('config', '{aw}');
</script>

<!-- Evento: Formulario Cotización Asbesto (se dispara al llegar a /gracias.html) -->
<script>
  gtag('event', 'conversion', {{
    'send_to': '{aw}/REEMPLAZAR_CON_LABEL',
    'value': 1.0,
    'currency': 'CLP'
  }});
</script>

NOTA: El LABEL se obtiene en Google Ads →
  Herramientas → Medición → Conversiones → "Formulario Cotización Asbesto" → Etiqueta""")

    # ─── ERRORES ────────────────────────────────────────────────────────
    if ERRORS:
        print(f"\n{sep}")
        print(f"  ERRORES ENCONTRADOS ({len(ERRORS)})")
        print(sep)
        for e in ERRORS:
            print(f"  ✗ {e}")
        print("\n  Los elementos sin errores fueron creados exitosamente.")
    else:
        print(f"\n{'─'*65}")
        print("  ✓ Todo creado sin errores.")

    print(sep)


if __name__ == "__main__":
    main()
