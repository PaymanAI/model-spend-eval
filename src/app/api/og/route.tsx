import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const score = searchParams.get('score');
  const model = searchParams.get('model');
  const verdict = searchParams.get('verdict');

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #1E40AF, #3B82F6)',
          width: '1200',
          height: '630',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '40px',
        }}
      >
        <div style={{ 
          fontSize: '48px', 
          fontWeight: 'bold',
          marginBottom: '20px',
          textAlign: 'center',
        }}>
          Can you trust {model} with your money? 💸
        </div>
        <div style={{ 
          fontSize: '28px',
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto',
          opacity: 0.9,
        }}>
          {verdict || `${score}% Success Rate - Try it yourself!`}
        </div>
        <div style={{ 
          position: 'absolute', 
          bottom: '40px', 
          fontSize: '24px',
          opacity: 0.8 
        }}>
          AI Payment Testing Suite
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
} 