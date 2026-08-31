import { Component, type ReactNode } from 'react'

/**
 * If the 3D path throws — a driver bug, a lost context, an unsupported
 * extension — the reader gets the still narrative instead of a blank page.
 *
 * The content is identical either way, so falling back costs them nothing but
 * the movement.
 */
export class NarrativeBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('3D narrative failed, showing the still version instead', error)
    this.props.onError()
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
