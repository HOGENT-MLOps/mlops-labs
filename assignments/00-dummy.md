# Lab 0 (Dummy): Prime Numbers in Python

In this lab assignment, you will progressively improve a Python script to calculate prime numbers in a given range. You will start with a basic brute-force method and gradually move towards more efficient heuristic-based approaches, optimizing your algorithm to handle larger numbers.

## :mortar_board: Learning Goals

- Understand the basic concept of prime numbers and how to identify them in a range.
- Learn how to implement a brute-force algorithm for prime number detection.
- Understand the performance limitations of the brute-force approach.
- Learn how to optimize prime number detection using more advanced algorithms.
- Use heuristics and mathematical properties to improve efficiency.

## :memo: Acceptance Criteria

- Show that you can calculate prime numbers in a range using a brute-force method.
- Show that you can optimize the algorithm by reducing redundant calculations.
- Implement a heuristic-based approach (like the Sieve of Eratosthenes) for better efficiency.
- Compare the performance of each approach using time measurements.
- Write a well-documented lab report in Markdown explaining each approach.
- Provide a visualization of the performance difference using graphs.
- Push your final Python scripts to a Git repository.

## 1.1 Setting up the Environment

Before starting, ensure you have Python installed on your machine. You can check this with the following command:

```bash
python --version
```

If Python is not installed, follow the installation instructions for your operating system:

- **Windows/Mac**: Download Python from [python.org](https://www.python.org/downloads/) and follow the instructions.
- **Linux**: Use your package manager (e.g., `sudo apt install python3` for Ubuntu, and `sudo dnf install python3` for Fedora).

You will also need to install any necessary packages, which can be done using your package manager or `pip`. For now, ensure you have `matplotlib` installed for later visualizations:

```bash
pip install matplotlib
```

## 1.2 Brute-force Prime Number Calculation

In this step, you will write a basic Python script to determine if a given number is prime using the brute-force approach. This approach checks if a number `n` has any divisors other than 1 and itself.

Create a Python script `find primes.py` that calculates the amount of primes between 1 and `n`.

To check if a number is prime, use the following tactic:

- Loop from 2 to `n-1` to check if `n` is divisible by any number in this range.
- If `n` has no divisors other than 1 and itself, it is prime.
- Otherwise, it is not prime.

```python
def is_prime_bruteforce(n):
    if n <= 1:
        return False
    for i in range(2, n):
        if n % i == 0:
            return False
    return True
```

Expand the existing script to calculate the number of prime numbers between 1 and `n` using this function. You should get the following results:

- 1229 primes in the range [0, 10_000].
- 9592 primes in the range [0, 100_000].

To check how long it takes for a piece of code to execute in python, you can use `time.perf_counter()`:

```python
import time

start_time = time.perf_counter()
function_to_time()
end_time = time.perf_counter()
print(f"Execution time: {end_time - start_time} seconds")
```

### Task

- Run the script and record the time it takes to find the amount of primes in [0, 10_000] and [0, 10_000].

## 1.3 Reducing Redundant Calculations

Optimize the brute-force method by reducing the range of numbers checked. Instead of checking all numbers from 2 to `n-1`, you can stop at $\sqrt{n}$ since if a number is divisible by any number larger than its square root, it must have a smaller divisor.

Modify your script to loop from 2 to $\sqrt{n}$ instead of `n-1`. You can use Python’s `math.sqrt()` function to calculate the square root.

```python
import math

def is_prime_optimized(n):
    if n <= 1:
        return False
    for i in range(2, int(math.sqrt(n)) + 1):
        if n % i == 0:
            return False
    return True
```

### Task

- Why do we use `int(math.sqrt(n)) + 1` and not just `math.sqrt(n)`?
- Run this optimized script and record the time it takes to find the amount of primes in [0, 10_000] and [0, 10_000].
  - Compare its performance with the brute-force version. What do you notice?

## 1.4 Sieve of Eratosthenes

In this section, you will implement the [Sieve of Eratosthenes](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes), a more efficient algorithm to find all prime numbers up to a given limit `n`. This method marks the multiples of each prime starting from 2, which ensures that only primes remain unmarked.

You can use the following code. Make sure you understand how it works and what is does.

```python
def sieve_of_eratosthenes(limit):
    # Create a list of boolean values, all initialized to True
    # Index represents the number, and True means it's assumed to be prime
    is_prime = [True] * (limit + 1)

    # 0 and 1 are not prime numbers, so mark them as False
    is_prime[0] = False
    is_prime[1] = False

    # Start with the first prime number, which is 2
    current_prime = 2

    # Loop through numbers until the square of the current prime exceeds the limit
    while current_prime * current_prime <= limit:
        if is_prime[current_prime]:
            # Mark all multiples of the current prime as non-prime
            for multiple in range(current_prime * current_prime, limit + 1, current_prime):
                is_prime[multiple] = False
        current_prime += 1

    # Return a list of numbers that are still marked as prime
    return [num for num in range(2, limit + 1) if is_prime[num]]
```

### Task

- Record the time taken to find the amount of primes in [0, 10_000] and [0, 10_000].
- Compare the performance of this approach with your previous implementations.What do you notice?

## 1.5 Performance Comparison

Create a graph showing the performance differences between the brute-force, optimized, and sieve methods. Use `matplotlib` to plot the results.

We will create a graph to visualize the evolution of calculation times as the upper limit increases. Instead of only calculating the primes in intervals with upper limits of 10_000 and 100_000, we will also calculate the number of primes for the following upper limits: 10_000, 50_000, 100_000, 500_000, and 1_000_000.

```python
import matplotlib.pyplot as plt

limits = [10_000, 50_000, 100_000, 500_000, 1_000_000]  # Sample limits
times_bruteforce = [/* fill with execution times */]
times_optimized = [/* fill with execution times */]
times_sieve = [/* fill with execution times */]

plt.plot(limits, times_bruteforce, label="Brute Force")
plt.plot(limits, times_optimized, label="Optimized")
plt.plot(limits, times_sieve, label="Sieve of Eratosthenes")
plt.xlabel("Number Size")
plt.ylabel("Execution Time (seconds)")
plt.title("Performance Comparison of Prime Number Algorithms")
plt.legend()
plt.show()
```

### Task

- Plot the execution time for each algorithm using upper limits of `[10_000, 50_000, 100_000, 500_000, and 1_000_000]`.
  1. Create a plot with only the graphs for the brute-force and the optimized approach (thus leave out the sieve approach).
  2. Now create a plot with all 3 approaches.
- You'll notice that the calculations for the higher limits are taking some time: be patient. What is the bottleneck here?
- Include this graph in your lab report, along with an explanation of the performance differences.

## Possible Extensions

- Implement more advanced prime number algorithms like [Miller-Rabin](https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test) or [AKS primality test](https://en.wikipedia.org/wiki/AKS_primality_test).
- Extend your script to handle very large numbers (beyond 10 million).
- Implement parallelization to further optimize the Sieve of Eratosthenes for multi-core processors.
