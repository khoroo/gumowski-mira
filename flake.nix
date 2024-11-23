{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };
  outputs = { self, nixpkgs }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-darwin"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      devShells = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };
          
          # Create tsconfig.json
          tsconfigFile = pkgs.writeText "tsconfig.json" ''
            {
              "compilerOptions": {
                "target": "ES2020",
                "lib": ["ES2020", "DOM"],
                "strict": true,
                "moduleResolution": "node",
                "esModuleInterop": true,
                "skipLibCheck": true,
                "forceConsistentCasingInFileNames": true,
                "outDir": "./docs"
              },
              "include": ["src/**/*"],
              "exclude": ["node_modules"]
            }
          '';

          # Updated build script that uses tsconfig.json
          buildScript = pkgs.writeShellScriptBin "build" ''
            ${pkgs.typescript}/bin/tsc -p tsconfig.json
            cp src/*.html docs/
          '';

          # Updated watch script that uses tsconfig.json
          watchScript = pkgs.writeShellScriptBin "watch" ''
            ${pkgs.typescript}/bin/tsc -p tsconfig.json --watch
          '';

          cleanScript = pkgs.writeShellScriptBin "clean" ''
            rm -rf docs/*
            rm -f tsconfig.json
          '';

          serveScript = pkgs.writeShellScriptBin "serve" ''
            echo "Serving on http://localhost:8000"
            ${pkgs.python3}/bin/python -m http.server 8000 --directory docs/
          '';
        in
        with pkgs; {
          default = mkShell {
            buildInputs = [
              typescript
              python3
              buildScript
              cleanScript
              watchScript
              serveScript
            ];
            shellHook = ''
              mkdir -p docs
              cp ${tsconfigFile} tsconfig.json
            '';
          };
        }
      );
    };
}