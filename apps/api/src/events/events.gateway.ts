import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { Server } from 'socket.io';
import type { WsTaskEvent } from '@socratech/contracts';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ws',
})
export class EventsGateway {
  @WebSocketServer()
  server!: Server;

  @OnEvent('socratech.event')
  handleSocratechEvent(event: WsTaskEvent): void {
    if (this.server) {
      this.server.emit('socratech.event', event);
      this.server.emit(event.event, event);
    }
  }
}
