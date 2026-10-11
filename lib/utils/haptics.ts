'use client'

// Minimal, safe haptics wrapper. On web, use navigator.vibrate when available.
// Provide named patterns for consistency.

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection';

export function isHapticsSupported(): boolean {
	if (typeof window === 'undefined') return false;
	try {
		const navAny = navigator as any;
		return typeof navAny?.vibrate === 'function';
	} catch (_) {
		return false;
	}
}

function vibrateOnce(durationMs: number): boolean {
	if (typeof window === 'undefined') return false;
	try {
		const navAny = navigator as any;
		if (typeof navAny?.vibrate === 'function') {
			return !!navAny.vibrate(durationMs);
		}
	} catch (_) {
		// no-op
	}
	return false;
}

function vibratePattern(pattern: number[]): boolean {
	if (typeof window === 'undefined') return false;
	try {
		const navAny = navigator as any;
		if (typeof navAny?.vibrate === 'function') {
			return !!navAny.vibrate(pattern);
		}
	} catch (_) {
		// no-op
	}
	return false;
}

export function haptic(pattern: HapticPattern = 'selection'): boolean {
	switch (pattern) {
		case 'light':
			return vibrateOnce(35);
		case 'selection':
			return vibrateOnce(30);
		case 'medium':
			return vibrateOnce(50);
		case 'heavy':
			return vibrateOnce(75);
		case 'success':
			return vibratePattern([20, 40, 20]);
		case 'error':
			return vibratePattern([50, 30, 50]);
	}
	return false;
}

export const Haptics = {
	selection: () => haptic('selection'),
	light: () => haptic('light'),
	medium: () => haptic('medium'),
	heavy: () => haptic('heavy'),
	success: () => haptic('success'),
	error: () => haptic('error'),
}


