import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'http://92.246.76.171:8080/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '';
  
  try {
    const headers: Record<string, string> = {};
    
    // Копируем заголовки из запроса
    request.headers.forEach((value, key) => {
      // Исключаем некоторые заголовки, которые могут вызвать проблемы
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/${path}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Ошибка при выполнении запроса' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '';
  
  try {
    const body = await request.json();
    const headers: Record<string, string> = {};
    
    // Копируем заголовки из запроса
    request.headers.forEach((value, key) => {
      // Исключаем некоторые заголовки, которые могут вызвать проблемы
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });
    
    // Добавляем Content-Type, если его нет
    if (!headers['content-type']) {
      headers['content-type'] = 'application/json';
    }
    
    const response = await fetch(`${API_BASE_URL}/${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Ошибка при выполнении запроса' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '';
  
  try {
    const body = await request.json();
    const headers: Record<string, string> = {};
    
    // Копируем заголовки из запроса
    request.headers.forEach((value, key) => {
      // Исключаем некоторые заголовки, которые могут вызвать проблемы
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });
    
    // Добавляем Content-Type, если его нет
    if (!headers['content-type']) {
      headers['content-type'] = 'application/json';
    }
    
    const response = await fetch(`${API_BASE_URL}/${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Ошибка при выполнении запроса' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
} 