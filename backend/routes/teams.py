from flask import Blueprint, request, jsonify
from services.supabase_client import supabase

teams_bp = Blueprint("teams", __name__)

VALID_TEAMS = {"Frontend", "Backend", "Design", "Business", "DevOps", "QA"}


@teams_bp.route("/teams/members", methods=["GET"])
def get_all_members():
    """Get all team members, optionally filtered by team."""
    team = request.args.get("team")
    try:
        query = supabase.table("team_members").select("*").order("name")
        if team:
            if team not in VALID_TEAMS:
                return jsonify({"error": f"Invalid team '{team}'"}), 400
            query = query.eq("team", team)
        response = query.execute()
        return jsonify(response.data), 200
    except Exception as e:
        print(f"[ERROR] get_all_members: {e}")
        return jsonify({"error": str(e)}), 500


@teams_bp.route("/teams/members", methods=["POST"])
def add_member():
    """Add a new team member."""
    data = request.get_json(silent=True) or {}
    team = data.get("team", "").strip()
    name = data.get("name", "").strip()
    role = data.get("role", "").strip()
    email = data.get("email", "").strip()

    if not team or not name:
        return jsonify({"error": "team and name are required"}), 400
    if team not in VALID_TEAMS:
        return jsonify({"error": f"Invalid team '{team}'"}), 400

    try:
        response = supabase.table("team_members").insert({
            "team": team,
            "name": name,
            "role": role,
            "email": email,
        }).execute()
        return jsonify(response.data[0] if response.data else {}), 201
    except Exception as e:
        print(f"[ERROR] add_member: {e}")
        return jsonify({"error": str(e)}), 500


@teams_bp.route("/teams/members/<int:member_id>", methods=["PUT"])
def update_member(member_id):
    """Update an existing team member."""
    data = request.get_json(silent=True) or {}
    updates = {}
    for field in ("name", "role", "email", "team"):
        if field in data:
            val = str(data[field]).strip()
            if field == "team" and val not in VALID_TEAMS:
                return jsonify({"error": f"Invalid team '{val}'"}), 400
            updates[field] = val

    if not updates:
        return jsonify({"error": "No fields to update"}), 400

    try:
        response = (
            supabase.table("team_members")
            .update(updates)
            .eq("id", member_id)
            .execute()
        )
        if not response.data:
            return jsonify({"error": "Member not found"}), 404
        return jsonify(response.data[0]), 200
    except Exception as e:
        print(f"[ERROR] update_member: {e}")
        return jsonify({"error": str(e)}), 500


@teams_bp.route("/teams/members/<int:member_id>", methods=["DELETE"])
def delete_member(member_id):
    """Delete a team member."""
    try:
        response = (
            supabase.table("team_members")
            .delete()
            .eq("id", member_id)
            .execute()
        )
        if not response.data:
            return jsonify({"error": "Member not found"}), 404
        return jsonify({"success": True}), 200
    except Exception as e:
        print(f"[ERROR] delete_member: {e}")
        return jsonify({"error": str(e)}), 500
