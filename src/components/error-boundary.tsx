import { Component, type ReactNode } from 'react'

interface State { error: Error | null }

/** Hàng rào lỗi toàn app: dữ liệu hỏng chỉ hiện thông báo, không làm trắng màn hình. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg, #FDF4EE)', padding: 20 }}>
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <div style={{ fontSize: 40 }}>🐷</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginTop: 10 }}>Có lỗi khi hiển thị dữ liệu</div>
          <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>
            Thường do một ô trong file Excel bị sửa tay sai định dạng. Mở lại app để thử lần nữa;
            nếu vẫn lỗi, kiểm tra các cột priority/status trong file.
          </p>
          <pre style={{ fontSize: 10.5, color: '#aa5555', whiteSpace: 'pre-wrap', textAlign: 'left', background: 'rgba(0,0,0,.04)', borderRadius: 8, padding: 10 }}>
            {this.state.error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 10, padding: '10px 20px', borderRadius: 999, border: 'none', background: '#F29BB1', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
          >
            Tải lại app
          </button>
        </div>
      </div>
    )
  }
}
