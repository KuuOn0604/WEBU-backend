import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SaveNoteDto } from './dto/save-note.dto';
import { Note } from './schemas/note.schema';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private readonly noteModel: Model<Note>,
  ) {}

  async getNote(userId: string, cardId: string): Promise<{ content: string }> {
    const note = await this.noteModel
      .findOne({ user_id: userId, card_id: cardId })
      .exec();

    return { content: note?.content || '' };
  }

  async saveNote(saveNoteDto: SaveNoteDto): Promise<Note | null> {
    const { user_id, card_id, content } = saveNoteDto;

    return await this.noteModel
      .findOneAndUpdate(
        { user_id, card_id },
        { content },
        { new: true, upsert: true },
      )
      .exec();
  }
}
