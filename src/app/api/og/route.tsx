import { ImageResponse } from 'next/og';
import * as Constants from '../../../constants';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const imageUrl = searchParams.get('imageUrl');
  const oem = searchParams.get('oem');
  const device = searchParams.get('device');
  const codename = searchParams.get('codename');

  const displayOem = oem?.slice(0, 50) || 'Evolution X';
  const displayDevice = device?.slice(0, 50) || 'Official Build';
  const displayCodename = codename?.slice(0, 50) || 'Device Info';
  const displayImageUrl = imageUrl || `${Constants.SITE}/Banner.png`;

  const [
    prodBoldFontData,
    prodNormalFontData,
  ] = await Promise.all([
    fetch(new URL('/fonts/ProductSans-Bold.woff', Constants.SITE)).then((res) => res.arrayBuffer()),
    fetch(new URL('/fonts/ProductSans-Regular.woff', Constants.SITE)).then((res) => res.arrayBuffer()),
  ]);

  if (!imageUrl && !oem && !device && !codename) {
    return new ImageResponse(
      <div
        style={{
          display: 'flex',
          fontSize: 40,
          color: 'white',
          background: '#040214',
          width: '100%',
          height: '100%',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '20px',
        }}
      >
        <p>Missing device information. Please provide URL parameters.</p>
        <p style={{ fontSize: 30 }}>Example: ?imageUrl=...&oem=...&device=...&codename=...</p>
      </div>,
      {
        width: 1200,
        height: 630,
      }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          color: 'white',
          background: '#040214',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '40px',
        }}
      >
        <img
          width="495"
          height="85"
          src={`${Constants.SITE}/evolution.svg`}
          style={{
            marginBottom: '20px',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginRight: '60px',
              width: '400px',
              height: '100%',
            }}
          >
            <img
              width="400"
              height="400"
              src={displayImageUrl}
              style={{
                borderRadius: 30,
                objectFit: 'contain',
                backgroundColor: '#0f172a',
                border: '3px solid rgba(0, 96, 255, 0.8)',
                padding: '20px',
                boxShadow: '0px 4px 20px 20px rgba(0, 96, 255, 0.05)',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              flexGrow: 1,
              maxWidth: '600px',
              paddingLeft: '20px',
            }}
          >
            <p
              style={{
                fontSize: 60,
                fontWeight: 'bold',
                lineHeight: 1.1,
                margin: '0',
                color: 'white',
                whiteSpace: 'pre-wrap',
                fontFamily: 'Prod-bold',
                marginTop: '-10px',
                marginBottom: '5px',
              }}
            >
              {displayOem} {displayDevice}
            </p>
            <p
              style={{
                fontSize: 30,
                color: 'rgb(0, 96, 255)',
                lineHeight: 1.1,
                margin: '0',
                whiteSpace: 'pre-wrap',
                fontFamily: 'Prod-Normal',
              }}
            >
              ({displayCodename})
            </p>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Prod-bold',
          data: prodBoldFontData,
          style: 'normal',
          weight: 700,
        },
        {
          name: 'Prod-Normal',
          data: prodNormalFontData,
          style: 'normal',
          weight: 400,
        },
      ],
    },
  );
}
