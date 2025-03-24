def travel_time(laps: int, tire_type: str, driving_style: str):
    """
    Symuluje jazdę przez określoną liczbę okrążeń (laps) z uwzględnieniem typu opon (tire_type)
    oraz stylu jazdy (driving_style). W tym wariancie styl jazdy PUSH lub CONSERVE obowiązuje
    tylko przez pierwsze 30 sekund każdego okrążenia, a potem wraca do NORMAL.
    Na początku kolejnego okrążenia znowu włącza się wybrany styl jazdy (PUSH/CONSERVE) na 30s.
    """
    
    TIRE_DEGRADATION = {
        "SOFT": 0.18,
        "MEDIUM": 0.09,
        "HARD": 0.06
    }

    TIRE_SPEED = {
        "SOFT": 30.5,
        "MEDIUM": 29,
        "HARD": 28
    }

    # Definicje stylów jazdy
    DRIVING_STYLES = {
        "PUSH": {"speedModifier": 2, "wearModifier": 0.12},
        "NORMAL": {"speedModifier": 0.0, "wearModifier": 0.0},
        "CONSERVE": {"speedModifier": -1.2, "wearModifier": -0.04}
    }

    lap_distance = 1300
    total_distance = laps * lap_distance

    base_speed = TIRE_SPEED[tire_type]
    decay_rate = TIRE_DEGRADATION[tire_type]

    style_modifiers = DRIVING_STYLES.get(driving_style, {"speedModifier": 0, "wearModifier": 0})
    style_speed_modifier = style_modifiers["speedModifier"]
    style_wear_modifier = style_modifiers["wearModifier"]

    tire_condition = 100.0
    time_elapsed = 0
    position = 0.0

    current_lap = 1
    lap_time = 0

    while position < total_distance:
        if current_lap > laps:
            break

        if driving_style in ("PUSH", "CONSERVE") and lap_time < 30:
            effective_speed = (base_speed + style_speed_modifier) * (tire_condition + 100) / 200
            tire_condition -= (decay_rate + style_wear_modifier)
        else:
            effective_speed = base_speed * (tire_condition + 100) / 200
            tire_condition -= decay_rate

        position += effective_speed
        time_elapsed += 1
        lap_time += 1

        if position >= current_lap * lap_distance:
            current_lap += 1
            lap_time = 0

    return time_elapsed, max(0, tire_condition)

if __name__ == "__main__":
    laps = 5
    tires = ["SOFT", "MEDIUM", "HARD"]
    styles = ["PUSH", "NORMAL", "CONSERVE"]

    for t in tires:
        for s in styles:
            time_needed, final_tire_condition = travel_time(laps, t, s)
            print(f"Time needed to complete {laps} laps with {t} tires and {s} style: {time_needed} seconds, Final tire condition: {final_tire_condition:.2f}%")
