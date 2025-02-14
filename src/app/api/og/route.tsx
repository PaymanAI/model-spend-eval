import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const score = searchParams.get('score');
  const model = searchParams.get('model');
  const verdict = searchParams.get('verdict');

  return new ImageResponse(
    (
      <div
        style={{
          height: '630px',
          width: '1200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #1E40AF, #3B82F6)',
          color: 'white',
          padding: '40px 80px',
        }}
      >
        {score ? (
          <>
            <div style={{ 
              fontSize: 72, 
              fontWeight: 'bold', 
              marginBottom: 40,
              textAlign: 'center',
              lineHeight: 1.1
            }}>
              {model} scored {score}% 💸
            </div>
            <div style={{ 
              fontSize: 36, 
              textAlign: 'center', 
              opacity: 0.9,
              maxWidth: '900px'
            }}>
              {verdict || `See how ${model} handled payment requests`}
            </div>
          </>
        ) : (
          <>
            <div style={{ 
              fontSize: 72, 
              fontWeight: 'bold', 
              marginBottom: 40,
              textAlign: 'center',
              lineHeight: 1.1
            }}>
              Which AI Model Is Best With Money? 💸
            </div>
            <div style={{ 
              fontSize: 36, 
              textAlign: 'center', 
              opacity: 0.9 
            }}>
              Try them all and see which is best!
            </div>
          </>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
} 