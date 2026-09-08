"""Apply versioned inspection rules to an adapter's visual observation."""


def normalize_observation(visual: dict, context: dict) -> dict:
    equipment_id = context.get("equipment_id") or "unknown"
    rule_id = context.get("inspection_rule_id") or "unknown"
    result = {
        "equipment_id": equipment_id,
        "inspection_rule_id": rule_id,
        "reading_or_state": None,
        "anomaly": None,
        "confidence": visual.get("confidence"),
        "uncertainty": visual.get("uncertainty", "high"),
        "target_status": visual.get("target_status", "invalid"),
        "review_required": True,
        "recommended_action": "",
        "model_raw": visual["model_raw"],
    }
    if not context.get("equipment_id"):
        result["recommended_action"] = "request equipment_id before assessment"
        return result
    rule = context.get("rule")
    if not context.get("inspection_rule_id") or rule is None:
        result["recommended_action"] = "request inspection_rule before assessment"
        return result

    if visual.get("target_status") in {"ambiguous", "invalid"}:
        result["recommended_action"] = context.get("mismatch_action") or "request target/equipment identification"
        return result

    if context.get("metadata_rule_mismatch") or visual.get("target_status") == "mismatch" or visual.get("rule_compatible") is False:
        result["reading_or_state"] = visual.get("reading_or_state")
        result["recommended_action"] = context.get("mismatch_action") or "request target/rule metadata confirmation"
        return result

    status = visual["visual_status"]
    if status == "unreadable":
        result["recommended_action"] = visual.get("uncertainty_action") or "request a clearer image"
        return result
    policy = rule["review_policy"]
    if status == "ambiguous":
        result["recommended_action"] = visual.get("uncertainty_action") or policy.get("near_threshold_action", policy.get("at_threshold_action", "request manual reading confirmation"))
        return result
    value = visual.get("reading_or_state")
    result["reading_or_state"] = value

    normal = rule["normal_range"]
    if isinstance(normal, dict):
        if not isinstance(value, (int, float)) or isinstance(value, bool):
            result["recommended_action"] = policy.get("near_threshold_action", "request manual reading confirmation")
            return result
        critical = rule["critical_range"]
        if normal["max"] < value < critical["min"]:
            result["recommended_action"] = policy["at_threshold_action"]
            return result
        is_normal = normal["min"] <= value <= normal["max"]
    else:
        is_normal = value in normal
    result["anomaly"] = not is_normal
    result["review_required"] = policy["normal_review_required"] if is_normal else policy["abnormal_review_required"]
    if visual.get("human_review_required") or visual.get("uncertainty") == "high":
        result["review_required"] = True
    result["recommended_action"] = policy["normal_action"] if is_normal else policy["abnormal_action"]
    return result
