import { Global, Module } from '@nestjs/common';
import { CacheClearService } from './services/cache-clear.service';

@Global() 
@Module({
  providers: [
    CacheClearService,
  ],
  exports: [
    CacheClearService,
  ],
})
export class CommonModule {}