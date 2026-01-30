import amqp, { Channel, ChannelModel, Options } from 'amqplib';
import { env } from '../../config/env.js';

class RabbitMQ {
  private static instance: RabbitMQ;

  private conn?: ChannelModel;
  private channel?: Channel;
  private connecting = false;
  private readonly url = env.RABBITMQ_URL;

  private constructor() {}

  static async getInstance(): Promise<RabbitMQ> {
    if (!RabbitMQ.instance) {
      RabbitMQ.instance = new RabbitMQ();
      await RabbitMQ.instance.connect();
    }
    return RabbitMQ.instance;
  }

  private async connect() {
    if (this.connecting) return;
    this.connecting = true;

    try {
      this.conn = await amqp.connect(this.url);
      this.conn.on('close', () => this.reconnect());

      this.channel = await this.conn.createConfirmChannel();
      this.channel.on('close', () => this.reconnect());

      this.setupProcessHooks();
      console.log('[RabbitMQ] connected');
    } catch (err) {
      console.error('[RabbitMQ] connect failed, retrying...', err);
      setTimeout(() => this.connect(), 3000);
    } finally {
      this.connecting = false;
    }
  }

  private async reconnect() {
    console.warn('[RabbitMQ] reconnecting...');
    this.channel = undefined;
    this.conn = undefined;
    await this.connect();
  }

  getChannel(): Channel {
    if (!this.channel) throw new Error('RabbitMQ channel not ready');
    return this.channel;
  }

  async produce(
    queue: string,
    payload: unknown,
    options: Options.Publish = {}
  ) {
    const ch = this.getChannel();

    await ch.assertQueue(queue, { durable: true });

    return ch.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      ...options,
    });
  }

  async consume(queue: string, handler: (data: any) => Promise<void>) {
    const ch = this.getChannel();
    await ch.assertQueue(queue, { durable: true });
    ch.prefetch(1);

    ch.consume(queue, async (msg) => {
      if (!msg) return;
      try {
        const data = JSON.parse(msg.content.toString());
        await handler(data);
        ch.ack(msg);
      } catch (err) {
        console.error('[RabbitMQ] consume error', err);
        ch.nack(msg, false, false);
      }
    });
  }

  private setupProcessHooks() {
    const shutdown = async () => {
      try {
        await this.channel?.close();
        await this.conn?.close();
      } finally {
        process.exit(0);
      }
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}

export default RabbitMQ;
