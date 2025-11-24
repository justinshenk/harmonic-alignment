#!/usr/bin/env python3
"""
Analyze correlations in traditions data to find non-obvious patterns.
"""
import json
import math
from collections import defaultdict

def mean(values):
    return sum(values) / len(values) if values else 0

def variance(values):
    if not values:
        return 0
    m = mean(values)
    return sum((x - m) ** 2 for x in values) / len(values)

def correlation(x_values, y_values):
    """Calculate Pearson correlation coefficient."""
    if len(x_values) != len(y_values) or len(x_values) == 0:
        return 0

    n = len(x_values)
    mean_x = mean(x_values)
    mean_y = mean(y_values)

    numerator = sum((x_values[i] - mean_x) * (y_values[i] - mean_y) for i in range(n))
    denominator_x = math.sqrt(sum((x - mean_x) ** 2 for x in x_values))
    denominator_y = math.sqrt(sum((y - mean_y) ** 2 for y in y_values))

    if denominator_x == 0 or denominator_y == 0:
        return 0

    return numerator / (denominator_x * denominator_y)

# Load data
with open('data/traditions.json', 'r') as f:
    data = json.load(f)

traditions = data['traditions']

print("=== CORRELATION ANALYSIS ===\n")

# 1. Complexity dimension correlations
print("1. COMPLEXITY DIMENSION CORRELATIONS")
print("-" * 50)

complexity_dims = ['somatic', 'intrapsychic', 'relational', 'collective', 'systemic', 'transpersonal']

# Calculate correlations
for i, dim1 in enumerate(complexity_dims):
    for j, dim2 in enumerate(complexity_dims):
        if i < j:  # Only upper triangle
            vals1 = [t['complexityProfile'][dim1] for t in traditions if t.get('complexityProfile')]
            vals2 = [t['complexityProfile'][dim2] for t in traditions if t.get('complexityProfile')]

            corr = correlation(vals1, vals2)
            if abs(corr) > 0.3:  # Only show moderate+ correlations
                print(f"{dim1} <-> {dim2}: {corr:.3f}")

# 2. Complexity vs Effectiveness correlations
print("\n2. COMPLEXITY → EFFECTIVENESS CORRELATIONS")
print("-" * 50)

effectiveness_dims = ['adhd', 'depression', 'anxiety', 'trauma',
                      'focus', 'metacognition', 'insight',
                      'compassion', 'communication', 'empathy',
                      'bodyAwareness', 'emotionalRegulation']

for comp_dim in complexity_dims:
    for eff_dim in effectiveness_dims:
        comp_vals = []
        eff_vals = []

        for t in traditions:
            if t.get('complexityProfile') and t.get('effectiveness'):
                comp_vals.append(t['complexityProfile'][comp_dim])
                eff_vals.append(t['effectiveness'][eff_dim])

        if len(comp_vals) > 5:
            corr = correlation(comp_vals, eff_vals)
            if abs(corr) > 0.4:  # Strong correlations only
                print(f"{comp_dim} → {eff_dim}: {corr:.3f}")

# 3. Find specialists vs generalists
print("\n3. SPECIALISTS VS GENERALISTS")
print("-" * 50)

for t in traditions:
    if t.get('complexityProfile'):
        profile = t['complexityProfile']
        values = [profile[dim] for dim in complexity_dims]

        max_val = max(values)
        var = variance(values)

        # Specialist: high max + high variance
        if max_val >= 5 and var > 2:
            dominant = [dim for dim in complexity_dims if profile[dim] == max_val]
            print(f"SPECIALIST - {t['name']}: {dominant[0]} ({max_val}), variance={var:.2f}")

# 4. Counter-intuitive patterns
print("\n4. COUNTER-INTUITIVE PATTERNS")
print("-" * 50)

# Low somatic but high trauma effectiveness
for t in traditions:
    if t.get('complexityProfile') and t.get('effectiveness'):
        if (t['complexityProfile']['somatic'] <= 2 and
            t['effectiveness']['trauma'] >= 4):
            print(f"Low somatic + High trauma: {t['name']} (somatic={t['complexityProfile']['somatic']}, trauma={t['effectiveness']['trauma']})")

# High collective but low relational
for t in traditions:
    if t.get('complexityProfile'):
        if (t['complexityProfile']['collective'] >= 4 and
            t['complexityProfile']['relational'] <= 2):
            print(f"High collective + Low relational: {t['name']} (collective={t['complexityProfile']['collective']}, relational={t['complexityProfile']['relational']})")

# High transpersonal + low ADHD effectiveness
for t in traditions:
    if t.get('complexityProfile') and t.get('effectiveness'):
        if (t['complexityProfile']['transpersonal'] >= 5 and
            t['effectiveness']['adhd'] <= 2):
            print(f"High transpersonal + Low ADHD: {t['name']}")

# 5. Origin patterns
print("\n5. PATTERNS BY ORIGIN/CULTURE")
print("-" * 50)

origin_profiles = defaultdict(lambda: defaultdict(list))

for t in traditions:
    if t.get('complexityProfile'):
        origin = t['origin']
        for dim in complexity_dims:
            origin_profiles[origin][dim].append(t['complexityProfile'][dim])

# Find distinctive origins
for origin, dims in origin_profiles.items():
    if len(dims['somatic']) >= 2:  # At least 2 traditions
        avg_somatic = mean(dims['somatic'])
        avg_transpersonal = mean(dims['transpersonal'])
        avg_relational = mean(dims['relational'])

        if avg_somatic >= 4.5:
            print(f"{origin}: HIGH somatic (avg={avg_somatic:.1f})")
        if avg_transpersonal >= 4.5:
            print(f"{origin}: HIGH transpersonal (avg={avg_transpersonal:.1f})")
        if avg_relational >= 4.5:
            print(f"{origin}: HIGH relational (avg={avg_relational:.1f})")

# 6. Time-based patterns
print("\n6. HISTORICAL EVOLUTION")
print("-" * 50)

# Modern (post-1950) vs Ancient (pre-0)
modern = [t for t in traditions if t.get('yearOrigin', 0) > 1950]
ancient = [t for t in traditions if t.get('yearOrigin', 0) < 0]

for dim in complexity_dims:
    if modern and ancient:
        modern_vals = [t['complexityProfile'][dim] for t in modern if t.get('complexityProfile')]
        ancient_vals = [t['complexityProfile'][dim] for t in ancient if t.get('complexityProfile')]

        if modern_vals and ancient_vals:
            modern_avg = mean(modern_vals)
            ancient_avg = mean(ancient_vals)
            diff = modern_avg - ancient_avg

            if abs(diff) > 0.5:
                direction = "↑" if diff > 0 else "↓"
                print(f"{dim}: Ancient={ancient_avg:.2f} → Modern={modern_avg:.2f} {direction}")

# 7. Combination patterns
print("\n7. POWERFUL COMBINATIONS")
print("-" * 50)

# Find traditions with multiple high dimensions
for t in traditions:
    if t.get('complexityProfile') and t.get('effectiveness'):
        profile = t['complexityProfile']
        high_dims = [dim for dim in complexity_dims if profile[dim] >= 5]

        if len(high_dims) >= 3:
            # Check if high effectiveness too
            eff = t['effectiveness']
            high_eff = sum(1 for v in eff.values() if v >= 4)

            if high_eff >= 6:
                print(f"{t['name']}: {len(high_dims)} high complexity dims + {high_eff} high effectiveness scores")
                print(f"  High in: {', '.join(high_dims)}")

print("\n=== ANALYSIS COMPLETE ===")
