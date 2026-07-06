import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { SaveNoteDto } from './dto/save-note.dto';
import { NotesService } from './notes.service';
import { Note } from './schemas/note.schema';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  getNote(
    @Query('userId') userId: string,
    @Query('cardId') cardId: string,
  ): Promise<{ content: string }> {
    return this.notesService.getNote(userId, cardId);
  }

  @Post()
  saveNote(@Body() saveNoteDto: SaveNoteDto): Promise<Note | null> {
    return this.notesService.saveNote(saveNoteDto);
  }
}
