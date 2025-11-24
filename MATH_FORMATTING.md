# Math Formatting Guide

The character-development.html page supports LaTeX math notation via MathJax.

## Inline Math

Use single dollar signs for inline math:
```
The policy $\pi(a|s)$ defines action probabilities.
```

Result: The policy $\pi(a|s)$ defines action probabilities.

## Display Math

Use double dollar signs for centered display equations:
```
$$
V(s) = \sum_{t=0}^{\infty} \gamma^t r_t
$$
```

Result:
$$
V(s) = \sum_{t=0}^{\infty} \gamma^t r_t
$$

## Common Notation Examples

### Greek Letters
- `$\pi$` → π (policy)
- `$\theta$` → θ (parameters)
- `$\gamma$` → γ (discount factor)
- `$\delta$` → δ (TD error)
- `$\alpha$` → α (learning rate)

### Operators
- `$\sum$` → summation
- `$\prod$` → product
- `$\nabla$` → gradient
- `$\mathbb{E}$` → expectation
- `$\approx$` → approximately equal

### Subscripts and Superscripts
- `$x_t$` → x with subscript t
- `$x^2$` → x squared
- `$x_{t+1}$` → x with subscript t+1
- `$e^{-x}$` → e to the -x

### Fractions
- `$\frac{a}{b}$` → a/b as fraction

### Parentheses (auto-sizing)
- `$\left( \frac{a}{b} \right)$` → parentheses that size to content

## Complete Examples

### Value Function
```
$$
V^\pi(s) = \mathbb{E}_\pi \left[ \sum_{t=0}^{\infty} \gamma^t r_t \mid s_0 = s \right]
$$
```

### Policy Gradient
```
$$
\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta} \left[ \sum_{t=0}^T \nabla_\theta \log \pi_\theta(a_t|s_t) \cdot R(\tau) \right]
$$
```

### TD Learning
```
$$
V(s_t) \leftarrow V(s_t) + \alpha \left[ r_t + \gamma V(s_{t+1}) - V(s_t) \right]
$$
```

### Bellman Equation
```
$$
Q^\pi(s,a) = \mathbb{E}_{s' \sim P} \left[ r(s,a) + \gamma \sum_{a'} \pi(a'|s') Q^\pi(s',a') \right]
$$
```

## Tips

1. **Test locally**: Math renders asynchronously, so refresh page to see changes
2. **Escape characters**: Use `\\` for backslash in HTML: `\\pi` not `\pi`
3. **Text in math**: Use `\text{...}` for normal text: `$\text{virtue}$`
4. **Spacing**: Use `\,` for small space, `\quad` for larger space
5. **Alignment**: For multi-line equations, use:
   ```
   $$
   \begin{align}
   x &= a + b \\
   y &= c + d
   \end{align}
   $$
   ```

## Resources

- [MathJax Documentation](https://docs.mathjax.org/)
- [LaTeX Math Symbols](https://www.overleaf.com/learn/latex/List_of_Greek_letters_and_math_symbols)
- [Detexify](http://detexify.kirelabs.org/classify.html) - Draw symbol to find LaTeX command
