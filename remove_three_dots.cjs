const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/MessageBubble.tsx', 'utf-8');

const targetBlock = `          {(isHost || isOwn) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-mono-500 hover:text-mono-700 hover:bg-mono-200">
                  <MoreVertical className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-mono-100 border-mono-300">
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
                {isHost && !isOwn && onMuteUser && (
                  <DropdownMenuItem onClick={onMuteUser}>
                    <VolumeX className="w-4 h-4 mr-2" />
                    Mute User
                  </DropdownMenuItem>
                )}
                {isHost && !isOwn && onKickUser && (
                  <DropdownMenuItem onClick={onKickUser} className="text-destructive">
                    <UserX className="w-4 h-4 mr-2" />
                    Kick & Ban
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}`;

content = content.replace(targetBlock, '');

fs.writeFileSync('src/components/shareroom/MessageBubble.tsx', content);
