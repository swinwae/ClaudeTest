#!/bin/bash
# setup-ecs.sh — 在阿里云 ECS 上一键安装 frps + Flask 服务
# 使用方法：ssh ecs 后执行 bash setup-ecs.sh

set -e

FRP_VERSION="0.61.1"
FRP_DIR="/opt/frp"
FRP_CONFIG="/etc/frp/frps.toml"

echo "==> 安装 frps ${FRP_VERSION}"
mkdir -p "$FRP_DIR"
cd /tmp
wget -q "https://github.com/fatedier/frp/releases/download/v${FRP_VERSION}/frp_${FRP_VERSION}_linux_amd64.tar.gz"
tar xzf "frp_${FRP_VERSION}_linux_amd64.tar.gz"
cp "frp_${FRP_VERSION}_linux_amd64/frps" /usr/local/bin/frps
chmod +x /usr/local/bin/frps

echo "==> 写入 frps 配置（请先编辑 ${FRP_CONFIG} 填入 token）"
mkdir -p /etc/frp
cat > "$FRP_CONFIG" << 'EOF'
bindPort = 7000
auth.method = "token"
auth.token  = "REPLACE_WITH_STRONG_TOKEN"
log.to    = "/var/log/frps.log"
log.level = "info"
EOF

echo "==> 注册 systemd 服务"
cat > /etc/systemd/system/frps.service << EOF
[Unit]
Description=FRP Server
After=network.target

[Service]
ExecStart=/usr/local/bin/frps -c ${FRP_CONFIG}
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable frps
systemctl start frps

echo "==> frps 已启动，端口 7000"
echo "    请确认阿里云安全组已放行 TCP 7000（入方向）"
echo "    15005 端口只供 Flask 本机使用，无需对外放行"
