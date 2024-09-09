#!/usr/bin/env python

import math
import matplotlib.pyplot as plt
import time


def is_prime_bruteforce(n):
    if n <= 1:
        return False
    for i in range(2, n):
        if n % i == 0:
            return False
    return True


def is_prime_optimized(n):
    if n <= 1:
        return False
    for i in range(2, int(math.sqrt(n)) + 1):
        if n % i == 0:
            return False
    return True


def find_primes(limit, prime_checker):
    primes = []
    for i in range(2, limit + 1):
        if prime_checker(i):
            primes.append(i)
    return primes


def sieve_of_eratosthenes(limit):
    primes = [True] * (limit + 1)
    p = 2
    while p * p <= limit:
        if primes[p]:
            for i in range(p * p, limit + 1, p):
                primes[i] = False
        p += 1
    return [p for p in range(2, limit + 1) if primes[p]]


def benchmark_prime_finder(n, prime_finder, prime_checker=None):
    start_time = time.perf_counter()
    if prime_checker:
        result = prime_finder(n, prime_checker)
    else:
        result = prime_finder(n)
    end_time = time.perf_counter()
    ellapsed_time = end_time - start_time
    return (result, ellapsed_time)


limits = [10_000, 50_000, 100_000, 500_000, 1_000_000]
bruteforce_times = []
optimized_times = []
sieve_times = []

for l in limits:
    print(f"limit: {l}")

    bruteforce_result, bruteforce_ellapsed_time = benchmark_prime_finder(
        l, find_primes, is_prime_bruteforce
    )
    optimized_result, optimized_ellapsed_time = benchmark_prime_finder(
        l, find_primes, is_prime_optimized
    )
    sieve_result, sieve_ellapsed_time = benchmark_prime_finder(l, sieve_of_eratosthenes)

    assert bruteforce_result == optimized_result == sieve_result

    bruteforce_times.append(bruteforce_ellapsed_time)
    optimized_times.append(optimized_ellapsed_time)
    sieve_times.append(sieve_ellapsed_time)

    print(f"primes found: {len(bruteforce_result)}")
    print(f"brute force: {bruteforce_ellapsed_time}")
    print(f"optimized: {optimized_ellapsed_time}")
    print(f"sieve: {sieve_ellapsed_time}")
    print()

plt.plot(limits, bruteforce_times, label="Brute Force")
plt.plot(limits, optimized_times, label="Optimized")
plt.xlabel("Number Size")
plt.ylabel("Execution Time (seconds)")
plt.title("Performance Comparison of Prime Number Algorithms")
plt.legend()
plt.show()

plt.plot(limits, bruteforce_times, label="Brute Force")
plt.plot(limits, optimized_times, label="Optimized")
plt.plot(limits, sieve_times, label="Sieve of Eratosthenes")
plt.xlabel("Number Size")
plt.ylabel("Execution Time (seconds)")
plt.title("Performance Comparison of Prime Number Algorithms")
plt.legend()
plt.show()
